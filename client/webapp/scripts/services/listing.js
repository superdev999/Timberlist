'use strict';

angular.module('timberListApp').factory('Listing', function($resource) {
  return $resource('/listings/:id/', {
      id: '@id',
      origin: '@origin',
      distance: '@distance'
    }, {
      update: {
        method: 'PUT',
        isArray: false
      },
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
