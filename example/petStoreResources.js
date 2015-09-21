(function (angular, undefined) {
    'use strict';

    var moduleName = 'petStoreResources';
    var merge = angular.merge;
    var isFunction = angular.isFunction;
    var isObject = angular.isObject;
    var keys = Object.keys;

    var mod = angular.module(moduleName, ['ngResource'])

    mod.provider('$resourceConfig', function ($provide, $injector) {
        var self = this;

        function invokeActions() {
            var args = Array.prototype.slice.call(arguments);

            return args.map(function (arg) {
                if (isObject(arg)) {
                    return keys(arg).reduce(function (memo, key) {
                        var value = arg[key];
                        memo[key] = isFunction(value) ? $injector.invoke(value) : value;
                        return memo;
                    }, {});
                } else if (isFunction(arg)) {
                    return $injector.invoke(arg);
                }
            });
        }

        this.config = function () {
            var actions = invokeActions.apply(null, arguments);
            actions.unshift(this.$$actions);
            merge.apply(null, actions);
            return self;
        };

        $provide.decorator('$resource', function ($delegate) {
            return function (url, paramDefaults, actions, options) {
                var resource;

                function configure(actions) {
                    actions = invokeActions(actions);
                    actions.unshift({}, resource && resource.$$actions || {});
                    actions = merge.apply(null, actions);

                    resource = $delegate(url, paramDefaults, actions, options);

                    resource.$config = configure;
                    resource.$$actions = actions;

                    return resource;
                }

                var nArgs = arguments.length;
                if (isObject(url)) {
                    if (nArgs === 1) {
                        actions = url;
                        url = null;
                        return configure(actions);
                    } else if (isObject(paramDefaults) && nArgs === 2) {
                        actions = paramDefaults;
                        paramDefaults = url;
                        return configure(actions);
                    }
                }

                return $delegate.apply(null, arguments);
            };
        });

        this.$get = angular.noop;
    });

    mod.provider('Pet', function ($injector, $resourceConfigProvider) {
        var self = this;

        this.$$actions = {};

        this.config = $resourceConfigProvider.config.bind(this);

        this.$get = function ($injector, $resourceConfig, $resource, apiUrl) {
            var actions = {
                'addPet': {
                    method: 'POST',
                    url: apiUrl + '/pet',
                },
                'updatePet': {
                    method: 'PUT',
                    url: apiUrl + '/pet',
                },
                'findPetsByStatus': {
                    method: 'GET',
                    url: apiUrl + '/pet/findByStatus',
                    isArray: true,
                },
                'findPetsByTags': {
                    method: 'GET',
                    url: apiUrl + '/pet/findByTags',
                    isArray: true,
                },
                'getPetById': {
                    method: 'GET',
                    url: apiUrl + '/pet/:petId',
                    params: {
                        'petId': '@petId',
                    },
                },
                'updatePetWithForm': {
                    method: 'POST',
                    url: apiUrl + '/pet/:petId',
                    params: {
                        'petId': '@petId',
                    },
                },
                'deletePet': {
                    method: 'DELETE',
                    url: apiUrl + '/pet/:petId',
                    params: {
                        'petId': '@petId',
                    },
                },
                'uploadFile': {
                    method: 'POST',
                    url: apiUrl + '/pet/:petId/uploadImage',
                    params: {
                        'petId': '@petId',
                    },
                },
            };

            actions = merge({}, actions, self.$$actions);
            return $resource(actions);
        };
    });

    mod.provider('Store', function ($injector, $resourceConfigProvider) {
        var self = this;

        this.$$actions = {};

        this.config = $resourceConfigProvider.config.bind(this);

        this.$get = function ($injector, $resourceConfig, $resource, apiUrl) {
            var actions = {
                'getInventory': {
                    method: 'GET',
                    url: apiUrl + '/store/inventory',
                },
                'placeOrder': {
                    method: 'POST',
                    url: apiUrl + '/store/order',
                },
                'getOrderById': {
                    method: 'GET',
                    url: apiUrl + '/store/order/:orderId',
                    params: {
                        'orderId': '@orderId',
                    },
                },
                'deleteOrder': {
                    method: 'DELETE',
                    url: apiUrl + '/store/order/:orderId',
                    params: {
                        'orderId': '@orderId',
                    },
                },
            };

            actions = merge({}, actions, self.$$actions);
            return $resource(actions);
        };
    });

    mod.provider('User', function ($injector, $resourceConfigProvider) {
        var self = this;

        this.$$actions = {};

        this.config = $resourceConfigProvider.config.bind(this);

        this.$get = function ($injector, $resourceConfig, $resource, apiUrl) {
            var actions = {
                'createUser': {
                    method: 'POST',
                    url: apiUrl + '/user',
                },
                'createUsersWithArrayInput': {
                    method: 'POST',
                    url: apiUrl + '/user/createWithArray',
                },
                'createUsersWithListInput': {
                    method: 'POST',
                    url: apiUrl + '/user/createWithList',
                },
                'loginUser': {
                    method: 'GET',
                    url: apiUrl + '/user/login',
                },
                'logoutUser': {
                    method: 'GET',
                    url: apiUrl + '/user/logout',
                },
                'getUserByName': {
                    method: 'GET',
                    url: apiUrl + '/user/:username',
                    params: {
                        'username': '@username',
                    },
                },
                'updateUser': {
                    method: 'PUT',
                    url: apiUrl + '/user/:username',
                    params: {
                        'username': '@username',
                    },
                },
                'deleteUser': {
                    method: 'DELETE',
                    url: apiUrl + '/user/:username',
                    params: {
                        'username': '@username',
                    },
                },
            };

            actions = merge({}, actions, self.$$actions);
            return $resource(actions);
        };
    });


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = moduleName;
        }
        exports = moduleName;
    }
}(angular));
