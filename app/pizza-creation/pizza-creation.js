'use strict';

angular.module('pizzApp.pizza.new', ['ngRoute', 'ngFileUpload'])

// Route Config
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/new', {
        templateUrl: 'pizza-creation/pizza-creation.html',
        controller: 'NewPizzaCtrl',
        resolve: {
            'currentAuth': ['Auth', function(Auth) {
                return Auth.$requireAuth();
            }]
        }
    });
}])

// Controller
.controller('NewPizzaCtrl', ['$scope', 'currentAuth', 'FBURL', '$firebaseArray', '$location', 'Upload', '$log', 'Pizza', 'PizzaRating',
    function($scope, currentAuth, FBURL, $firebaseArray, $location, Upload, $log, Pizza, PizzaRating) {

        // Function: mandatory for getting the input from the smartphone camera
        $scope.add = function () {
            $log.info($scope.pizza.img);
        };

        // Function: form submission
        $scope.addNewPizza = function () {
            var newRating = PizzaRating.createRating();
            var newPizza = Pizza.createPizza($scope.pizza, currentAuth.uid, newRating);

            Upload.base64DataUrl($scope.pizza.img).then(function (base64Url) {
                newPizza['image'] = base64Url;
                Pizza.postPizza(newPizza).then(function () {
                    $location.path("/pizzas");
                });
            });

            // TODO: add the pizzas to the user data, too
        };

    }]);