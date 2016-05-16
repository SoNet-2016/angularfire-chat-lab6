'use strict';

angular.module('pizzApp.pizza.details', ['ngRoute', 'pizzApp.pizza'])

// Route Config    
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/pizzas/:pizzaId', {
        templateUrl: 'pizza-detail/pizza-detail.html',
        controller: 'PizzaDetailCtrl',
        resolve: {
            'currentAuth': ['Auth', function(Auth) {
                return Auth.$requireAuth();
            }]
        }
    });
}])

// Controller
.controller('PizzaDetailCtrl', ['$scope', '$routeParams', 'Pizza', 'PizzaRating', 'uiGmapGoogleMapApi', '$log',
    function($scope, $routeParams, Pizza, PizzaRating, uiGmapGoogleMapApi, $log) {
        $scope.pizza = Pizza.getPizza($routeParams.pizzaId);
        $scope.voteSaved = false;

        // When the pizza detail has been loaded completely from Firebase...
        $scope.pizza.$loaded().then(function(pizzaInfo) {
            // When Google Maps is ready...
            uiGmapGoogleMapApi.then(function(maps) {
                // init
                $scope.marker = {};
                $scope.marker.coords = {};
                var geocoder = new maps.Geocoder();

                // create the map
                $scope.map = { center: { latitude: 45.06, longitude: 7.67 }, zoom: 14 };

                // create the marker on the map
                geocoder.geocode({'address': pizzaInfo.address}, function(results, status) {
                    if (status === maps.GeocoderStatus.OK) {
                        var lat = results[0].geometry.location.lat();
                        var lng = results[0].geometry.location.lng();

                        // I need to manipulate the already existent object!
                        $scope.marker.coords.latitude = lat;
                        $scope.marker.coords.longitude = lng;
                        // center the map to the marker position
                        $scope.map.center = {latitude: lat, longitude: lng};
                    } else {
                        $log.error('Geocode was not successful for the following reason: ' + status);
                    }
                });
            });
        });
        
        // Function: add a vote to a specific pizza
        $scope.setRating = function(){
            PizzaRating.updateRating($routeParams.pizzaId, $scope.pizza.rating.value);
            $scope.voteSaved = true;
        };

}]);