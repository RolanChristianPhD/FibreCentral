'use strict';

/**
 * @ngdoc function
 * @name portal2App.controller:VerificationCtrl
 * @description
 * # VerificationCtrl
 * Controller of the portal2App
 */
angular.module('portal2App')
  .controller('VerificationCtrl', function ($scope, $http, envService, $routeParams) {

    $scope.emailAddress = $routeParams.emailAddress;

  	var envApiGatewayIpPort;
    envService.then(function(response){
      envApiGatewayIpPort = response.data.apiGatewayIpPort;

      var emailAddress = {"emailAddress" : $routeParams.emailAddress};

      $http.post("https://" + envApiGatewayIpPort + "/customer/emailVerified", emailAddress).then(
        function(successResponse){
          console.log(successResponse);
        },
        function(errorResponse){
          console.log(errorResponse);
          //Maybe alert that deals with incorrent then move to main page to register
        });

    });

  });