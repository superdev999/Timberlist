'use strict';

angular.module('timberListApp')
  .controller('LogoutCtrl', function ($scope, $location, djangoAuth) {
    djangoAuth.logout();
  });
