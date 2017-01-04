'use strict';

angular.module('timberListApp')
  .controller('PasswordresetCtrl', function ($scope, djangoAuth, Validate) {
    $scope.model = {'email':''};
    $scope.complete = false;
    $scope.resetPassword = function(formData){
      $scope.errors = [];
      Validate.formValidation(formData,$scope.errors);
      if(!formData.$invalid){
        djangoAuth.resetPassword($scope.model.email)
        .then(function(data){
          // success case
          $scope.complete = true;
        },function(data){
          // error case
          $scope.errors = data;
        });
      }
    };
  });
