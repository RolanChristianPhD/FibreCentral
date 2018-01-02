'use strict';

/**
 * @ngdoc function
 * @name portal2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the portal2App
 */
angular.module('portal2App')
  .controller('MainCtrl', function ($scope, $http, $location, envService, browserLocationService) {

    var envApiGatewayIpPort;
    envService.then(function(response){
      envApiGatewayIpPort = response.data.apiGatewayIpPort;
    });

    $scope.coordinates = "Johannesburg";
    $scope.user = {};
    $scope.user.coordinates = {};
    $scope.statusResult = "";
    $scope.showAlert = {};
    $scope.showAlert.show = false;

    $scope.submitAddress = function() {
      $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + $scope.address).then(
        function(successResponse){
          if(successResponse.data.results.length > 0) {
            console.log(successResponse.data.results);
            $scope.coordinates = successResponse.data.results[0].geometry.location.lat + "," + successResponse.data.results[0].geometry.location.lng;
            $scope.user.coordinates.longitude = successResponse.data.results[0].geometry.location.lng;
            $scope.user.coordinates.latitude = successResponse.data.results[0].geometry.location.lat;
            $scope.user.address = $scope.address;
          }
        }, 
        function(errorResponse){
          console.log(errorResponse);
          alert("System error in registering address. Please try again later");
          $scope.markerOn = false;
        });     
    };

    $scope.getBrowserLocation = function() {
      browserLocationService.getBrowserLocation().then(function(position){
        $scope.coordinates = position.coords.latitude + ',' + position.coords.longitude;  
        $scope.user.coordinates.longitude = position.coords.longitude;
        $scope.user.coordinates.latitude = position.coords.latitude;
        console.log($scope.coordinates);
      }, function(error){
        alert(error);
      }, function(update){
        console.log(update);
      });   
    };

    $scope.clickMap = function(event) {
      $scope.coordinates = event.latLng.lat() + "," + event.latLng.lng();
      $scope.user.coordinates.longitude = event.latLng.lng();
      $scope.user.coordinates.latitude = event.latLng.lat();
    };

    $scope.submit = function() {
      if(!$scope.user.address && !$scope.user.coordinates.longitude) {
        alert("Please submit address or use the Find me service");
        return;
      }

      if(!$scope.registerForm.$valid)
        return;      

      $http.post("https://" + envApiGatewayIpPort + "/customer", $scope.user).then(
        function(successResponse){
          console.log(successResponse);
          if(successResponse.data == "User already exists") {
            alert("You have already registered");
            return;
          }

          if(successResponse.data == "User saved to DB") {
            $location.path('/congrats');
          }          
        }, 
        function(errorResponse){
          console.log(errorResponse);
          alert("System error. We have been notified of the error and will attend to it.");
          return;
        } 
      );
    };

    $scope.checkStatus = function() {
    	 $http.get("https://" + envApiGatewayIpPort + "/customer/fibreStatus/" + $scope.userEmail).then(
          function(successResponse){
            console.log(successResponse);

            if(successResponse.data == "User does not exist") {
              $scope.statusResult = "You have not registered";
              $scope.showAlert.type = "warning"; 
              $scope.showAlert.show = true;
              return;
            }

            $scope.showAlert.type = "success"; 
            $scope.showAlert.show = true;
            $scope.statusResult = "Fibre " + successResponse.data;
            
        }, 
        function(errorResponse){
          console.log(errorResponse);
          
          if(errorResponse.status == 404) {
            $scope.showAlert.type = "danger"; 
            $scope.showAlert.show = true;
            $scope.statusResult = "Please enter valid email address";
          }

        } 
      );
    };

  });
