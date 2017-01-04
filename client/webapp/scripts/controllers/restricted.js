'use strict';

/**
 * @ngdoc function
 * @name timberListApp.controller:RestrictedCtrl
 * @description
 * # RestrictedCtrl
 * Controller of the timberListApp
 */
angular.module('timberListApp')
  .controller('RestrictedCtrl', function ($scope, $location) {
    $scope.$on('djangoAuth.logged_in', function() {
      $location.path('/');
    });
  });
