'use strict';

angular.module('pizzApp.login', ['ngRoute', 'pizzApp.users'])

// Route Config
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
    });
}])

// Controller
.controller('LoginCtrl', ['$scope', 'Auth', '$location', '$log','UsersChatLoginManager',
    function($scope, Auth, $location, $log, UsersChatLoginManager) {
        $scope.auth = Auth;

        // Function: login
        $scope.login = function() {
            $scope.error = null;

            // try to login with the given mail and password
            $scope.auth.$authWithPassword($scope.user).then(function(authData) {
                // login successful: save login on firebase + redirect to the pizza list
                UsersChatLoginManager.registerLogin(authData.uid);
                $location.path("/pizzas");
            }).catch(function(error) {
                // print and log the error
                $scope.error = error.message;
                $log.error(error.message);
            });
        };
    }]);
