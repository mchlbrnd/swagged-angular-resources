(function(angular, undefined) {
    'use strict';
    var moduleName = 'petStoreResources';
    var merge = angular.merge;
    var isFunction = angular.isFunction;
    var isObject = angular.isObject;
    var keys = Object.keys;

    var mod = angular.module(moduleName, ['ngResource']);

    mod.provider('$resourceConfig', function($provide, $injector) {
        var self = this;

        function invokeActions() {
            var args = Array.prototype.slice.call(arguments);

            return args.map(function(arg) {
                if (isObject(arg)) {
                    return keys(arg).reduce(function(memo, key) {
                        var value = arg[key];
                        memo[key] = isFunction(value) ? $injector.invoke(value) : value;
                        return memo;
                    }, {});
                } else if (isFunction(arg)) {
                    return $injector.invoke(arg);
                }
            });
        }

        this.config = function() {
            var actions = invokeActions.apply(null, arguments);
            actions.unshift(this.$$actions);
            merge.apply(null, actions);
            return self;
        };

        $provide.decorator('$resource', function($delegate) {
            return function(url, paramDefaults, actions, options) {
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

    /**
     * @ngdoc service
     * @name petStoreResources.Pet
     **/
    function Pet($resourceConfigProvider) {
        var self = this;
        this.$$actions = {};
        this.config = $resourceConfigProvider.config.bind(this);

        this.$get = function($resource, apiUrl) {
            var actions = {
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:addPet
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Add a new pet to the store
                 **/
                'addPet': {
                    method: 'POST',
                    url: apiUrl + '/pet',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:updatePet
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Update an existing pet
                 **/
                'updatePet': {
                    method: 'PUT',
                    url: apiUrl + '/pet',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:findPetsByStatus
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Finds Pets by status
                 **/
                'findPetsByStatus': {
                    method: 'GET',
                    url: apiUrl + '/pet/findByStatus',
                    isArray: true,
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:findPetsByTags
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Finds Pets by tags
                 **/
                'findPetsByTags': {
                    method: 'GET',
                    url: apiUrl + '/pet/findByTags',
                    isArray: true,
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:getPetById
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Find pet by ID
                 **/
                'getPetById': {
                    method: 'GET',
                    url: apiUrl + '/pet/:petId',
                    params: {
                        'petId': '@petId',
                    },
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:updatePetWithForm
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Updates a pet in the store with form data
                 **/
                'updatePetWithForm': {
                    method: 'POST',
                    url: apiUrl + '/pet/:petId',
                    params: {
                        'petId': '@petId',
                    },
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:deletePet
                 * @methodOf petStoreResources.Pet
                 * @description
                 * Deletes a pet
                 **/
                'deletePet': {
                    method: 'DELETE',
                    url: apiUrl + '/pet/:petId',
                    params: {
                        'petId': '@petId',
                    },
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Pet.method:uploadFile
                 * @methodOf petStoreResources.Pet
                 * @description
                 * uploads an image
                 **/
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
    }
    mod.provider('Pet', Pet);

    /**
     * @ngdoc service
     * @name petStoreResources.Store
     **/
    function Store($resourceConfigProvider) {
        var self = this;
        this.$$actions = {};
        this.config = $resourceConfigProvider.config.bind(this);

        this.$get = function($resource, apiUrl) {
            var actions = {
                /**
                 * @ngdoc method
                 * @name petStoreResources.Store.method:getInventory
                 * @methodOf petStoreResources.Store
                 * @description
                 * Returns pet inventories by status
                 **/
                'getInventory': {
                    method: 'GET',
                    url: apiUrl + '/store/inventory',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Store.method:placeOrder
                 * @methodOf petStoreResources.Store
                 * @description
                 * Place an order for a pet
                 **/
                'placeOrder': {
                    method: 'POST',
                    url: apiUrl + '/store/order',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Store.method:getOrderById
                 * @methodOf petStoreResources.Store
                 * @description
                 * Find purchase order by ID
                 **/
                'getOrderById': {
                    method: 'GET',
                    url: apiUrl + '/store/order/:orderId',
                    params: {
                        'orderId': '@orderId',
                    },
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.Store.method:deleteOrder
                 * @methodOf petStoreResources.Store
                 * @description
                 * Delete purchase order by ID
                 **/
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
    }
    mod.provider('Store', Store);

    /**
     * @ngdoc service
     * @name petStoreResources.User
     **/
    function User($resourceConfigProvider) {
        var self = this;
        this.$$actions = {};
        this.config = $resourceConfigProvider.config.bind(this);

        this.$get = function($resource, apiUrl) {
            var actions = {
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:createUser
                 * @methodOf petStoreResources.User
                 * @description
                 * Create user
                 **/
                'createUser': {
                    method: 'POST',
                    url: apiUrl + '/user',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:createUsersWithArrayInput
                 * @methodOf petStoreResources.User
                 * @description
                 * Creates list of users with given input array
                 **/
                'createUsersWithArrayInput': {
                    method: 'POST',
                    url: apiUrl + '/user/createWithArray',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:createUsersWithListInput
                 * @methodOf petStoreResources.User
                 * @description
                 * Creates list of users with given input array
                 **/
                'createUsersWithListInput': {
                    method: 'POST',
                    url: apiUrl + '/user/createWithList',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:loginUser
                 * @methodOf petStoreResources.User
                 * @description
                 * Logs user into the system
                 **/
                'loginUser': {
                    method: 'GET',
                    url: apiUrl + '/user/login',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:logoutUser
                 * @methodOf petStoreResources.User
                 * @description
                 * Logs out current logged in user session
                 **/
                'logoutUser': {
                    method: 'GET',
                    url: apiUrl + '/user/logout',
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:getUserByName
                 * @methodOf petStoreResources.User
                 * @description
                 * Get user by user name
                 **/
                'getUserByName': {
                    method: 'GET',
                    url: apiUrl + '/user/:username',
                    params: {
                        'username': '@username',
                    },
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:updateUser
                 * @methodOf petStoreResources.User
                 * @description
                 * Updated user
                 **/
                'updateUser': {
                    method: 'PUT',
                    url: apiUrl + '/user/:username',
                    params: {
                        'username': '@username',
                    },
                },
                /**
                 * @ngdoc method
                 * @name petStoreResources.User.method:deleteUser
                 * @methodOf petStoreResources.User
                 * @description
                 * Delete user
                 **/
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
    }
    mod.provider('User', User);


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = moduleName;
        }
        exports = moduleName;
    }
})(angular);