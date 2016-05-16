'use strict';

angular.module('pizzApp.pizza.list', ['ngRoute', 'pizzApp.pizza'])

// Route Config
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/pizzas', {
        templateUrl: 'pizza-list/pizza-list.html',
        controller: 'PizzaListCtrl',
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in app.js
            'currentAuth': ['Auth', function(Auth) {
                // $requireAuth returns a promise so the resolve waits for it to complete
                // if the promise is rejected, it will throw a $stateChangeError
                return Auth.$requireAuth();
            }]
        }
    });
}])

// Controller
.controller('PizzaListCtrl', ['$scope', 'Pizza', 'uiGmapGoogleMapApi', '$log',
    function($scope, Pizza, uiGmapGoogleMapApi, $log) {
        $scope.pizzas = Pizza.getPizzas();
        $scope.orderProp = 'id';
        $scope.pizzaMarkers = [];

        // When the pizza list has been loaded completely from Firebase...
        $scope.pizzas.$loaded().then(function () {
            // When Google Maps is ready...
            uiGmapGoogleMapApi.then(function(maps) {
                // init
                $scope.pizzaMarkers= [];
                var geocoder = new maps.Geocoder();

                // create the map
                $scope.map = { center: { latitude: 45.06, longitude: 7.67 }, zoom: 14 };

                // create the markers on the map
                for (var i = 0; i < $scope.pizzas.length; i++) {
                    createMarker(i, $scope.pizzas[i], geocoder);
                }
            });
        });

        // Function: create a single marker on the Google Map
        var createMarker = function (index, pizzaInfo, geocoder) {
            // geocode function: get an address from GPS coordinates
            geocoder.geocode({'address': pizzaInfo.address}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var marker = {
                        latitude: results[0].geometry.location.lat(),
                        longitude: results[0].geometry.location.lng(),
                        title: pizzaInfo.pizzeria
                    };
                    marker['id'] = index; // mandatory id
                    $scope.pizzaMarkers.push(marker);
                } else {
                    $log.error('Geocode was not successful for the following reason: ' + status);
                }
            });

        }
        
}]);