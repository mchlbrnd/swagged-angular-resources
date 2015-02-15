swagged-angular-resources
=========================
AngularJS $resource code generator written in CoffeeScript for Swagger v2.0 documentated endpoints.
## Install globally through npm
```bash
$ npm install -g swagged-angular-resources
```
## Usage
```bash
$ swagged-angular-resources <swagger-docs-url|swagger-docs-file>
```
## Example
Run the following command:
```bash
$ swagged-angular-resources https://raw.githubusercontent.com/swagger-api/swagger-spec/master/examples/v2.0/json/petstore-expanded.json
```
This will output the following AngularJS code:
```javascript
angular.module('swaggedAngularResources', ['ngResource'])
.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})
.provider('pet', function() {
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
