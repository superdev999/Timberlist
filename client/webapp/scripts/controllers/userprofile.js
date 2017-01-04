'use strict';

angular.module('timberListApp')
.directive('tlProfileList', function() {
  return {
    scope: {
      query_opts: '=queryOpts',
    },
    templateUrl: 'views/profiles/tablelist.html',
    replace: true,
    controller: 'UserProfileListCtrl',
    controllerAs: 'vm',
  };
}).controller('UserProfileListCtrl', function($scope, $location, $window, UserProfile) {
  this.profiles = UserProfile.query($scope.query_opts);
}).controller('UserprofileCtrl', function ($scope, djangoAuth, Validate, Upload, $timeout, uiGmapGoogleMapApi) {
  $scope.model = {
    'id': -1,
    'first_name':'',
    'last_name':'',
    'email':'',
    'buyer':false,
    'seller':false,
    'consultant':false,
    'mill':false,
    'company_name':'',
    'phone':'',
    'fax':'',
    'cell':'',
    'address1':'',
    'address2':'',
    'zipcode':'',
    'county':'',
    'state':'',
    'country':''
  };
  $scope.complete = false;
  $scope.photoComplete = false;

  djangoAuth.profile().then(function(data){
    $scope.model = data;
  });

  $scope.modelPreview = {};
  $scope.showPreview = false;

  $scope.autoComplete = function() {
    $scope.processingPreview = true;
    uiGmapGoogleMapApi.then(function(maps) {
      var geocoder = new maps.Geocoder();
      geocoder.geocode( { 'address': $scope.model.address1+", "+$scope.model.zipcode}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          $scope.modelPreview.numResults = results.length;
          for(var i = 0; i < results[0].address_components.length; i++) {
            var address = results[0].address_components[i];
            var types = address.types;
            if(_.includes(types, "street_number")) {
              $scope.modelPreview.street_number = address.short_name;
            } else if(_.includes(types, "route")) {
              $scope.modelPreview.route = address.short_name;
            } else if(_.includes(types, "locality")) {
              $scope.modelPreview.city = address.short_name;
            } else if(_.includes(types, "administrative_area_level_2")) {
              $scope.modelPreview.county = address.short_name;
            } else if(_.includes(types, "administrative_area_level_1")) {
              $scope.modelPreview.state = address.short_name;
            } else if(_.includes(types, "country")) {
              $scope.modelPreview.country = address.short_name;
            } else if(_.includes(types, "postal_code")) {
              $scope.modelPreview.zipcode = address.short_name;
            }
          }
          $scope.modelPreview.address1 = $scope.modelPreview.street_number + " " + $scope.modelPreview.route;

          $scope.modelPreview.lat_long = {
            type: 'Point',
            coordinates: [
              results[0].geometry.location.lat(),
              results[0].geometry.location.lng()
            ]
          };
          $scope.$apply();
          console.log("Matched! "+results[0].geometry.location);
        } else {
          console.log("Geocode was not successful for the following reason: " + status);
        }
        $scope.showPreview = true;
        $scope.processingPreview = false;
        $scope.$apply();
      });
    });
  };

  $scope.populate = function() {
    $scope.model.address1 = $scope.modelPreview.address1;
    $scope.model.zipcode = $scope.modelPreview.zipcode;
    $scope.model.city = $scope.modelPreview.city;
    $scope.model.county = $scope.modelPreview.county;
    $scope.model.state = $scope.modelPreview.state;
    $scope.model.country = $scope.modelPreview.country;
    $scope.model.lat_long = $scope.modelPreview.lat_long;
    $scope.showPreview = false;
  };

  $scope.updateProfile = function(formData, model){
    $scope.errors = [];
    Validate.formValidation(formData,$scope.errors);
    if(!formData.$invalid){
      djangoAuth.updateProfile(model)
      .then(function(data){
        // success case
        $scope.complete = true;
      },function(data){
        // error case
        $scope.error = data;
      });
    }
  };

  $scope.uploadPhoto = function(croppedDataUrl, fileName, model) {
    Upload.upload({
      url: '/users/' + model.id + '/image/',
      method: 'PUT',
//            data: {user: exp.user.id},
      file: Upload.dataUrltoBlob(croppedDataUrl, fileName)
    }).then(function (response) {
      $timeout(function () {
        $scope.photoComplete = true;
      });
    }, function (response) {
      if (response.status > 0) {
        $scope.errorMsg = response.status + ': ' + response.data;
      }
    }, function (evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  };
}).controller('UserprofileViewCtrl', function($scope, $routeParams, UserProfile) {
  if($routeParams.id) {
    $scope.model = UserProfile.get({ id: $routeParams.id });
    $scope.active_query_opts = {
      owner_id: $routeParams.id,
      active: true
    };
    $scope.closed_query_opts = {
      owner_id: $routeParams.id,
      active: false
    };
  }
});
