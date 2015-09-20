(function (angular) {
    var app = angular.module('petStore', ['petStoreResources']);

    app.constant('apiUrl', 'http://petstore.swagger.io/v2');

    app.config(function (PetProvider) {
        PetProvider.config({
            getPetById: {
                timeout: 1
            }
        });
    });

    app.factory('getPetByIdConfig', function () {
        return {
            getPetById: {
                timeout: 5000
            }
        }
    });

    app.controller('PetStoreController', function ($scope, Pet, getPetByIdConfig) {
        $scope.pets = [
            Pet.$config(getPetByIdConfig).getPetById({petId: 1}), // should succeed, timeout = 5s
            Pet.getPetById({petId: 2}) // should be cancelled, timeout = 1ms
        ];
    });
}(angular));