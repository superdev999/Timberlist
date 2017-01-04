'use strict';

angular.module('timberListApp').factory('Tract', function($resource) {
  return $resource('/tracts/:id/', { id: '@id' }, {
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
  });
});
