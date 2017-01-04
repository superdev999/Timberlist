'use strict';

angular.module('timberListApp')
  .controller('MapWindowCtrl', function ($scope, $location) {
    $scope.openTab = function(url) {
      //window.open(url);
      $location.path(url);
    };
  });
