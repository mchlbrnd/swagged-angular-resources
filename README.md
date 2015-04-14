swagged-angular-resources
=========================
AngularJS $resource code generator written in CoffeeScript for Swagger v2.0 documentated endpoints.
## Install globally through npm
```bash
$ npm install -g swagged-angular-resources
```
## Usage
```bash
$ swagged-angular-resources swagger-docs-url|swagger-docs-file <angular-module-name=moduleName> <--strip-trailing-slashes>
```
## Example
Run the following command:
```bash
$ swagged-angular-resources https://raw.githubusercontent.com/swagger-api/swagger-spec/master/examples/v2.0/json/petstore-expanded.json --angular-module-name=swaggedAngularResources --strip-trailing-slashes
```
This will output the following AngularJS code:
```javascript
(function(angular) {
  'use strict';

  angular
    .module('swaggedAngularResources', [
      require('angular-resource')
    ])
    .config(function($resourceProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
    })
    .provider('Pet', function() {
      this.$get = function($resource, apiUrl) {
        return $resource(null, null, {
          findPets: {
            method: 'GET',
            url: apiUrl + '/pets',
            isArray: true,
          },
          addPet: {
            method: 'POST',
            url: apiUrl + '/pets',
          },
          findPetById: {
            method: 'GET',
            url: apiUrl + '/pets/:id',
            params: {
              'id': '@id',
            },
          },
        });
      };
    });

    module.exports = 'swaggedAngularResources';
})(angular);
```

From your AngularJS application module:
```javascript
(function(angular) {
  angular
    .module('myAngularApp', [
      require('./resources.js'
    ])
    .value('apiUrl', 'http://petstore.swagger.io/v2/') // injecting apiUrl
    .run(function(Pet) {
      var pet, pets;
      // use class based function to retrieve all pets
      pets = Pet.findPets();
      
      // and optionally pass url templating parameters or $resource callbacks
      pet = Pet.findPetById({id: 1}, function(success) {}, function(error) {});
      
      // create a new Pet object
      pet = new Pet({name: 'Goldfishy'});
      // use instance based functions on Pet object
      pet.$addPet();
    });
})(angular);
```
## Develop with swagged-angular-resources
Fork or clone this repository! And then run:
```bash
$ npm install 
```
and then
```bash
$ npm link
```
and then
```bash
$ gulp watch
```

## Changelog
### 0.0.10
- Added @ngdoc generation argument (default: --ngdoc=false)

### 0.0.9
- Changed angular module name argument (default: --angular-module-name=swaggedAngularResources)
- Added configurable $resource strip trailing slashes configuration (default: --strip-trailing-slashes=false)
- Added yargs for easier argument parsing

### 0.0.8
- Added configurable angular module name (2nd argument)
- Added IIFE to provider template

## TODO
- Add arguments to script such as (default apiUrl value as argument or from Swagger docs)
- Add service and factory templates
