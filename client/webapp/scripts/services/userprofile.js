'use strict';

angular.module('timberListApp').factory('UserProfile', function($resource) {
  return $resource('/userprofiles/:id/', {
      id: '@id',
      origin: '@origin',
      distance: '@distance'
    }, {
      query: {
        method: 'GET',
        transformResponse: function (data) {
          return angular.fromJson(data).results;
        },
        isArray: true
      }
    }
  );
});
