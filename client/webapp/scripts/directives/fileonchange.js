'use strict';

angular.module('timberListApp')
.directive('fileOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.fileOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});
