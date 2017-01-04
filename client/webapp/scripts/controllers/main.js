'use strict';

angular.module('timberListApp')
  .controller('MainCtrl', function ($geolocation, $scope, $cookies, $location, djangoAuth, $http, Listing, UserProfile, uiGmapIsReady) {

    $scope.goVerify = function(){
      $location.path("/verifyEmail/"+window.prompt("Please enter verification code"));
    };

    $scope.goConfirmReset = function(){
      $location.path("/passwordResetConfirm/"+window.prompt("Code 1")+"/"+window.prompt("Code 2"));
    };

    var handleSuccess = function(data){
      $scope.response = data;
    };

    var handleError = function(data){
      $scope.response = data;
    };

    $scope.show_login = true;
    $scope.$on("djangoAuth.logged_in", function(data){
      $scope.show_login = false;
    });
    $scope.$on("djangoAuth.logged_out", function(data){
      $scope.show_login = true;
    });

    $scope.queryListings = function() {
      if($scope.query_opts.enable_listings) {
        var oldListings = Listing.listings;
        Listing.listings = Listing.query($scope.query_opts);
        Listing.listings.$promise.then(function (result) {
          $scope.updateListingMarkers(result, oldListings);
          $scope.listings = Listing.listings;
          $scope.listingsLoading = false;
        });
      } else {
        $scope.updateListingMarkers([], Listing.listings);
        Listing.listings = [];
        $scope.listings = [];
        $scope.listingsLoading = false;
      }
    };

    $scope.queryProfiles = function() {
      if($scope.query_opts.enable_mills || $scope.query_opts.enable_buyers || $scope.query_opts.enable_consultants) {
        var oldProfiles = UserProfile.userprofiles;
        UserProfile.userprofiles = UserProfile.query($scope.query_opts);
        UserProfile.userprofiles.$promise.then(function (result) {
          $scope.updateProfileMarkers(result, oldProfiles);
          $scope.profilesLoading = false;
        });
      } else {
        $scope.updateProfileMarkers([], UserProfile.userprofiles);
        UserProfile.userprofiles = [];
        $scope.profilesLoading = false;
      }
    };

    $scope.queryItems = function() {
      $scope.profilesLoading = $scope.listingsLoading = true;
      uiGmapIsReady.promise(1).then(function (maps) {
        var bounds = maps[0].map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        $scope.query_opts.bounds = new google.maps.LatLngBounds(sw, ne);
        $scope.queryListings();
        $scope.queryProfiles();
      });
    };

    $scope.map = {
      dragging: false,
      zoom: 10,
      markers: [],
      center: {
        latitude: 36.06175562409685,
        longitude: -79.79187014512718
      },
      options: {
        minZoom: 4,
        maxZoom: 18,
        backgroundColor: '#C0D6BF'
      },
      events: {
        idle: function (maps, eventName, args) {
          $scope.queryItems();
        }
      },
      showWindow: false,
      closeClick: function() {
        this.showWindow = false;
      }
    };

    $geolocation.getCurrentPosition().then(function(location) {
      $scope.map.center = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    });

    $scope.query_opts = {
      origin: $scope.map.center,
      bounds: {},
      enable_listings: true,
      enable_mills: true,
      enable_buyers: true,
      enable_consultants: true,
      published: true
    };

    Listing.listings = [];
    $scope.updateListingMarkers = function(newListings, oldListings) {
      _.differenceWith(newListings, oldListings, function(a, b) {
        return a.id === b.id;
      }).forEach( function(listing) {
        if(listing.tract && listing.tract.lat_long && listing.tract.lat_long.coordinates) {
          var marker = {
            id: 'l'+listing.id,
            coords: {
              //highpoint 36.060420, -79.947475
              latitude: listing.tract.lat_long.coordinates[0],
              longitude: listing.tract.lat_long.coordinates[1]
            },
            options: {
              draggable: false,
              show: true,
              icon:'images/tree-marker.png'
            },
            events: {
              click: function(mapModel, eventName, originalEventArgs) {
                $scope.selectedMarker = marker;
                $scope.map.showWindow = true;
              }
            },
            showWindow: false,
            type: 'listing',
            listing: listing,
            template: 'views/listing/windowview.html'
          };
          $scope.map.markers.push(marker);
        }
      });
      _.differenceWith(oldListings, newListings, function(a, b) {
        return a.id === b.id;
      }).forEach( function(listing) {
        _.remove($scope.map.markers, function(marker) {
          return marker.id === 'l'+listing.id;
        });
      });
    };

    UserProfile.userprofiles = [];
    $scope.updateProfileMarkers = function(newUserProfiles, oldUserProfiles) {
      _.differenceWith(newUserProfiles, oldUserProfiles, function(a, b) {
        return a.id === b.id;
      }).forEach( function(userprofile) {
        if(userprofile.address && userprofile.address.lat_long && userprofile.address.lat_long.coordinates) {
          var icon = 'images/profile-marker.png';
          if(userprofile.mill && !userprofile.buyer && !userprofile.consultant ) {
            icon = 'images/mill-marker.png';
          } else if(userprofile.mill) {
            icon = 'images/profile-mill-marker.png';
          }
          var marker = {
            id: 'm'+userprofile.id,
            coords: {
              latitude: userprofile.address.lat_long.coordinates[0],
              longitude: userprofile.address.lat_long.coordinates[1]
            },
            options: {
              draggable: false,
              show: true,
              icon: icon
            },
            events: {
              click: function(mapModel, eventName, originalEventArgs) {
                $scope.selectedMarker = marker;
                $scope.map.showWindow = true;
              }
            },
            showWindow: false,
            userprofile: userprofile,
            type: 'mill',
            template: 'views/profiles/windowview.html'
          };
          $scope.map.markers.push(marker);
        }
      });
      _.differenceWith(oldUserProfiles, newUserProfiles, function(a, b) {
        return a.id === b.id;
      }).forEach( function(userprofile) {
        _.remove($scope.map.markers, function(marker) {
          return marker.id === 'm'+userprofile.id;
        });
      });
    };
  });
