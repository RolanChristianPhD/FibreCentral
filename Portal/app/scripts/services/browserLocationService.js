'use strict';

/**
 * @ngdoc function
 * @name portal2App.service:browserLocationService
 * @description
 * # browserLocationService
 * Service for obtaining browser geo-locaation
 */
angular.module('portal2App')
	.service('browserLocationService', function($q) {
        this.getBrowserLocation = function() {
            var deferred = $q.defer();

            deferred.notify("Processing location");
            
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    console.log("Allowed");
                    deferred.resolve(position);
                }, function(error){
                    console.log("Browser restricted");
                    deferred.reject("Browser settings do not allow access to your location");
                });                     
            } else {
                console.log("Geo-location not supported");
                deferred.reject("Geo-location not supported");
            }

            return deferred.promise;    
        }
	});