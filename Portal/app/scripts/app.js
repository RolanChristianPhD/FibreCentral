  'use strict';

/**
 * @ngdoc overview
 * @name portal2App
 * @description
 * # portal2App
 *
 * Main module of the application.
 */
angular
  .module('portal2App', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch', 'ngMap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        controllerAs: 'contact'
      })
      .when('/verification/:emailAddress', {
        templateUrl: 'views/verification.html',
        controller: 'VerificationCtrl',
        controllerAs: 'verify'
      })
      .when('/congrats', {
        templateUrl: 'views/congrats.html'
      })      

      .otherwise({
        redirectTo: '/'
      });
  });
