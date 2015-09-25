(function (angular) {
    var app = angular.module('petStore', ['petStoreResources']);

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
        $scope.pets = [];

        function addPet (pet) {
            $scope.pets.push(pet);
        }

        var Milo = new Pet({name: 'Milo'});
        var Kitty = new Pet({name: 'Kitty'});

        Milo.$addPet(function (milo) {
            Pet.getPetById({petId: milo.id}, addPet); // should be cancelled, timeout = 1ms
        });

        Kitty.$addPet(function (kitty) {
            Pet.$config(getPetByIdConfig).getPetById({petId: kitty.id}, addPet); // should succeed, timeout = 5s
        });
    });
}(angular));