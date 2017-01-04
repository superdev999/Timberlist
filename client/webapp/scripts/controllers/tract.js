'use strict';

angular.module('timberListApp')
.controller('TractListCtrl', function($scope, $location, $window, Tract) {
  Tract.tracts = Tract.query();
  $scope.tracts = Tract.tracts; //fetch all Tracts. Issues a GET to /api/Tracts
//  console.log("scope.tracts: "+JSON.stringify($scope.tracts));

  $scope.deleteTract = function(Tract) { // Delete a Tract. Issues a DELETE to /api/Tracts/:id
    if (window.confirm('Really delete this?')) {
      Tract.$delete().then( function() {
        $scope.tracts = Tract.query();
      });
    }
  };
}).controller('TractViewCtrl', function($scope, $routeParams, Tract) {
  $scope.tract = Tract.get({ id: $routeParams.id }); //Get a single Tract.Issues a GET to /api/Tracts/:id
}).controller('TractCreateCtrl', function($scope, $location, $routeParams, Tract) {
  $scope.tract = new Tract();  //create new Tract instance. Properties will be set via ng-model on UI
  $scope.tracts = Tract.query();

  $scope.addTract = function() { //create a new Tract. Issues a POST to /api/Tracts
    $scope.tract.$save(function() {
      $location.path('/tracts'); // on success go back to home i.e. Tracts state.
    });
  };
}).controller('TractEditCtrl', function($scope, $location, $routeParams, Tract) {
  $scope.tracts = Tract.query();

  $scope.updateTract = function() { //Update the edited Tract. Issues a PUT to /api/Tracts/:id
    $scope.tract.$update(function() {
      $location.path('/tracts'); // on success go back to home i.e. Tracts state.
    });
  };

  $scope.loadTract = function() { //Issues a GET request to /api/Tracts/:id to get a Tract to update
    $scope.tract = Tract.get({ id: $routeParams.id });
  };

  $scope.loadTract(); // Load a Tract which can be edited on UI
});
