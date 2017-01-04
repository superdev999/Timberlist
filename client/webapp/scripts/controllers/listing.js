'use strict';

angular.module('timberListApp')
.directive('tlListingList', function() {
  return {
    scope: {
      query_opts: '=queryOpts',
    },
    templateUrl: 'views/listing/tablelist.html',
    replace: true,
    controller: 'ListingListCtrl',
    controllerAs: 'vm',
  };
}).controller('ListingListCtrl', function($scope, $location, $window, Listing, djangoAuth, $q) {
  if($scope.query_opts && 'owner_id' in $scope.query_opts) {
    djangoAuth.profile().then(angular.bind(this, function(data) {
      $scope.query_opts.owner_id = data.id;
      this.listings = Listing.query($scope.query_opts);
    }));
  } else {
    this.listings = Listing.query($scope.query_opts);
  }

  $scope.deleteListing = function(Listing) {
    if (window.confirm('Really delete this?')) {
      Listing.$delete().then( function() {
        $scope.listings = Listing.query();
      });
    }
  };
}).controller('ListingViewCtrl', function($scope, $routeParams, Listing) {
  if($routeParams.id) {
    $scope.listing = Listing.get({ id: $routeParams.id });
    $scope.mill_query_opts = {
      from_listing_id: $routeParams.id,
      distance: 100,
      enable_mills: true
    };
  }
}).controller('ListingCreateCtrl', function($scope, $location, $routeParams, Listing, Tract, $geolocation, $q) {
  $scope.listing = new Listing();
  $scope.tracts = Tract.query();
  $scope.tract = {};
  $scope.selectedTractId = null;
  $scope.map = {
    show: true,
    zoom: 10,
    marker: {
      id: 0,
      options:{
      }
    },
    center: {
      latitude: 36.06175562409685,
      longitude: -79.79187014512718
    },
    events: {
      click: function (mapObject, eventName, originalEventArgs) {
        var e = originalEventArgs[0];
        $scope.map.marker = {
          id: 0,
          coords: {
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
          },
          options: {
            draggable: true,
            show: true
          }
        };
        $scope.$evalAsync();
        $scope.updateTractFromMap();
        //mapObject.panTo(e.latLng);
      }
    }
  };

  $scope.searchbox = {
    template:'searchbox.tpl.html',
    events: {
      place_changed: function (searchBox) {
        var place = searchBox.getPlace();
        if (!place) {
          console.log('No match found.');
          return;
        }
        $scope.map.center = {
          latitude:place.geometry.location.lat(),
          longitude:place.geometry.location.lng()
        };
      }
    },
    position:"TOP_RIGHT",
    options:{
      autocomplete:true,
      types:['geocode']
    }
  };

  $scope.updateTractFromMap = function() {
    if($scope.tract !== null && $scope.map.marker.coords !== null) {
      $scope.tract.lat_long = {
        type: 'Point',
        coordinates: [
          $scope.map.marker.coords.latitude,
          $scope.map.marker.coords.longitude
        ]
      };
    }
  };

  $scope.updateMapFromTract = function() {
    if('lat_long' in $scope.tract && $scope.tract.lat_long !== null) {
      $scope.map.marker = {
        id: 0,
        coords: {
          latitude: $scope.tract.lat_long.coordinates[0],
          longitude: $scope.tract.lat_long.coordinates[1]
        },
        options: {
          draggable: true,
          show: true
        }
      };
      $scope.map.center = {
        latitude: $scope.tract.lat_long.coordinates[0],
        longitude: $scope.tract.lat_long.coordinates[1]
      };
    } else {
      $scope.map.marker = {
        id: 0,
        options:{
        }
      };
    }
    $scope.$evalAsync();
  };

  $scope.addListing = function() {
    $scope.listing.tract = $scope.tract;
    $scope.listing.$save(function() {
      $location.path('/portfolio');
    });
  };

  $scope.selectTract = function() {
    if(this.selectedTractId === null) {
      $scope.tract = {};
      $scope.listing.tract = {};
      $scope.updateMapFromTract();
      return $q.when($scope.tract);
    } else {
      return Tract.get({
        id: this.selectedTractId
      }).$promise.then(function(value) {
        $scope.listing.tract = value;
        $scope.tract = value;
        $scope.updateMapFromTract();
      });
    }
  };

  $geolocation.getCurrentPosition().then(function(location) {
    $scope.map.center = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  });

}).controller('ListingEditCtrl', function($scope, $location, $routeParams, Listing, Tract, $geolocation, $q, Upload, $http, uiGmapIsReady) {
  $scope.tracts = Tract.query();
  $scope.tract = {};
  $scope.selectedTractId = null;
  $scope.map = {
    show: true,
    zoom: 10,
    marker: {
      id: 0,
      options:{
      }
    },
    center: {
      latitude: 36.06175562409685,
      longitude: -79.79187014512718
    },
    events: {
      click: function (mapObject, eventName, originalEventArgs) {
        var e = originalEventArgs[0];
        $scope.map.marker = {
          id: 0,
          coords: {
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
          },
          options: {
            draggable: true,
            show: true
          }
        };
        $scope.$evalAsync();
        $scope.updateTractFromMap();
        //mapObject.panTo(e.latLng);
      }
    }
  };

  $scope.searchbox = {
    template:'searchbox.tpl.html',
    events: {
      place_changed: function (searchBox) {
        var place = searchBox.getPlace();
        if (!place) {
          console.log('No match found.');
          return;
        }
        $scope.map.center = {
          latitude:place.geometry.location.lat(),
          longitude:place.geometry.location.lng()
        };
      }
    },
    position:"TOP_RIGHT",
    options:{
      autocomplete:true,
      types:['geocode']
    }
  };

  $scope.updateTractFromMap = function() {
    if($scope.tract !== null && $scope.map.marker.coords !== null) {
      $scope.tract.lat_long = {
        type: 'Point',
        coordinates: [
          $scope.map.marker.coords.latitude,
          $scope.map.marker.coords.longitude
        ]
      };
    }
  };

  $scope.updateMapFromTract = function() {
    if('lat_long' in $scope.tract && $scope.tract.lat_long !== null) {
      $scope.map.marker = {
        id: 0,
        coords: {
          latitude: $scope.tract.lat_long.coordinates[0],
          longitude: $scope.tract.lat_long.coordinates[1]
        },
        options: {
          draggable: true,
          show: true
        }
      };
      $scope.map.center = {
        latitude: $scope.tract.lat_long.coordinates[0],
        longitude: $scope.tract.lat_long.coordinates[1]
      };
    } else {
      $scope.map.marker = {
        id: 0,
        options:{
        }
      };
    }
    $scope.$evalAsync();
  };

  $scope.updateListing = function() {
    $scope.listing.tract = $scope.tract;
    $scope.listing.$update(function() {
      $location.path('/portfolio');
    });
  };

  $scope.autosaveListing = function() {
    $scope.listing.tract = $scope.tract;
    if('id' in $scope.listing) {
      $scope.listing.$update(function(data) {
        console.log(data);
      });
    } else {
      $scope.listing.$save(function(value) {
        $scope.selectedTractId = $scope.listing.tract.id;
        $scope.selectTract();
      });
    }
  };

  $scope.uploadFile = function(file) {
    Upload.upload({
        url: '/files/',
        method: 'POST',
        data: { file: file, filename: file.name, listing_id: $scope.listing.id }
      }).then(function (response) {
        $scope.listing.files.push(response.data);
        $scope.fileComplete = true;
      }, function (response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
        }
      }, function (evt) {
        $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
      });
  };

  $scope.deleteFile = function(file) {
    $http.delete(file.url)
      .then(function(response) {
        var index = $scope.listing.files.indexOf(file);
        $scope.listing.files.splice(index, 1);
      });
  };

  $scope.selectTract = function() {
    if(this.selectedTractId === null) {
      $scope.tract = {};
      $scope.listing.tract = {};
      $scope.updateMapFromTract();
      return $q.when($scope.tract);
    } else {
      return Tract.get({
        id: this.selectedTractId
      }).$promise.then(function(value) {
        $scope.listing.tract = value;
        $scope.tract = value;
        $scope.updateMapFromTract();
      });
    }
  };

  $scope.loadListing = function() {
    if('id' in $routeParams) {
      Listing.get({
        id: $routeParams.id
      }).$promise.then(function(value) {
        $scope.listing = value;
        $scope.selectedTractId = $scope.listing.tract.id;
        $scope.selectTract().then( function() {
          if(!('lat_long' in $scope.tract) || $scope.tract.lat_long === null) {
            $geolocation.getCurrentPosition().then(function(location) {
              $scope.map.center = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              };
            });
          }
        });
      });
    } else {
      $scope.listing = new Listing();
    }
  };

  $scope.loadListing();
})
.controller('ListingWizardCtrl',  function ($uibModalInstance) {
  var modal = this;
  modal.steps = ['one', 'two', 'three', 'four', 'five'];
  modal.step = 0;
  modal.wizard = {tacos: 2};
  modal.isCurrentStep = function (step) {
    return modal.step === step;
  };
  modal.setCurrentStep = function (step) {
    modal.step = step;
  };
  modal.getCurrentStep = function () {
    return modal.steps[modal.step];
  };
  modal.isFirstStep = function () {
    return modal.step === 0;
  };

  modal.isLastStep = function () {
    return modal.step === (modal.steps.length - 1);
  };

  modal.getNextLabel = function () {
    return (modal.isLastStep()) ? 'Submit' : 'Next';
  };

  modal.handlePrevious = function () {
    modal.step -= (modal.isFirstStep()) ? 0 : 1;
  };

  modal.handleNext = function () {
    if (modal.isLastStep()) {
      $uibModalInstance.close(modal.wizard);
    } else {
      modal.step += 1;
    }
  };

  modal.dismiss = function(reason) {
    $uibModalInstance.dismiss(reason);
  };
});
