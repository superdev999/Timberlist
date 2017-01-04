'use strict';

angular.module('timberListApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'uiGmapgoogle-maps',
  'ngGeolocation',
  'ui.bootstrap.datetimepicker',
  'ngImgCrop',
  'ngFileUpload',
  'ngAnimate',
  'ui.bootstrap'
])
.config(function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
})
.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})
.config(['uiGmapGoogleMapApiProvider', function(GoogleMapApi) {
  GoogleMapApi.configure({
    key: 'AIzaSyASKnpHSOxpZISn83x1Q752UDDTydGu2K0',
    //v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'places'
  });
}])
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/register', {
      templateUrl: 'views/register.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/passwordReset', {
      templateUrl: 'views/passwordreset.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/passwordResetConfirm/:firstToken/:passwordResetToken', {
      templateUrl: 'views/passwordresetconfirm.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/login', {
      templateUrl: 'views/login.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/verifyEmail/:emailVerificationToken', {
      templateUrl: 'views/verifyemail.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/logout', {
      templateUrl: 'views/logout.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/userProfile', {
      templateUrl: 'views/userprofile.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/userProfile/:id/view', {
      templateUrl: 'views/userprofile/view.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/passwordChange', {
      templateUrl: 'views/passwordchange.html',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/restricted', {
      templateUrl: 'views/restricted.html',
      controller: 'RestrictedCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus();
        }],
      }
    })
    .when('/authRequired', {
      templateUrl: 'views/authrequired.html',
      controller: 'AuthrequiredCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/listings', {
      templateUrl: 'views/listing/list.html',
      controller: 'ListingListCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/listings/:id/view', {
      templateUrl: 'views/listing/view.html',
      controller: 'ListingViewCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/listings/new', {
      templateUrl: 'views/listing/add.html',
      controller: 'ListingCreateCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/listings/:id/edit', {
      templateUrl: 'views/listing/edit.html',
      controller: 'ListingEditCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/tracts', {
      templateUrl: 'views/tract/list.html',
      controller: 'TractListCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/tracts/:id/view', {
      templateUrl: 'views/tract/view.html',
      controller: 'TractViewCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/tracts/new', {
      templateUrl: 'views/tract/add.html',
      controller: 'TractCreateCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/tracts/:id/edit', {
      templateUrl: 'views/tract/edit.html',
      controller: 'TractEditCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .when('/portfolio', {
      templateUrl: 'views/portfolio.html',
      controller: 'PortfolioCtrl',
      resolve: {
        authenticated: ['djangoAuth', function(djangoAuth){
          return djangoAuth.authenticationStatus(true);
        }],
      }
    })
    .otherwise({
      redirectTo: '/'
    });
})
.run(function(djangoAuth){
    djangoAuth.initialize('/rest-auth', false);
  });
