'use strict';

angular.module('pizzApp.navigation.back', [])

.directive('backButton', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.bind("click", function () {
                $window.history.back();
            });
        }
    };
}])

.directive('showBackButton', ['$location', function ($location) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            scope.$on('$routeChangeStart', function () {
                if($location.path().search(/.+(\/.)+/)!=0)
                    elem.addClass('ng-hide');
                else
                    elem.removeClass('ng-hide');
            });
        }
    };
}]);