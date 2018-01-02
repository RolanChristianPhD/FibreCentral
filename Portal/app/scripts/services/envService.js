'use strict';

/**
 * @ngdoc function
 * @name portal2App.service:envService
 * @description
 * # envservice
 * Service for obtainign enviroment settings
 */
angular.module('portal2App')
	.service('envService', function($http) {
	  return $http.get('config/envServiceConfig.json').then(function(response){
	    return response;
	  });
	});