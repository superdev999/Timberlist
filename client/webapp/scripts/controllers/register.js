'use strict';

angular.module('timberListApp')
  .controller('RegisterCtrl', function ($scope, djangoAuth, Validate) {
    $scope.model = {'username':'','password':'','email':''};
    $scope.complete = false;
    $scope.register = function(formData){
      $scope.errors = [];
      Validate.formValidation(formData,$scope.errors);
      if(!formData.$invalid){
        djangoAuth.register($scope.model.username,$scope.model.password1,$scope.model.password2,$scope.model.email)
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
