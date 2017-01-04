'use strict';

angular.module('timberListApp')
  .controller('PortfolioCtrl', function ($scope, $cookies, djangoAuth, $http, Listing, UserProfile, $q, $uibModal) {
    $scope.active_query_opts = {
      owner_id: $scope.current_user.id,
      active: true,
      published: true
    };
    $scope.closed_query_opts = {
      owner_id: $scope.current_user.id,
      active: false,
      published: true
    };
    $scope.draft_query_opts = {
      owner_id: $scope.current_user.id,
      published: false
    };

    $scope.open = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'views/listing/wizard.html',
        controller: 'ListingWizardCtrl',
        controllerAs: 'modal'
      });
    };
  });
