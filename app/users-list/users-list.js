'use strict';

angular.module('pizzApp.users.list', ['ngRoute', 'pizzApp.users'])

// Route Config
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/chat', {
        templateUrl: 'users-list/users-list.html',
        controller: 'UsersListCtrl',
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
.controller('UsersListCtrl', ['$scope', '$log', 'UsersService', 'currentAuth',
    function($scope, $log, UsersService, currentAuth ) {
        //get users list from firebase (using "UsersService" service)
        $scope.userId = currentAuth.uid;
        $scope.users = UsersService.getUsers();
    }
]);