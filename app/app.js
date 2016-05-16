'use strict';

// Declare app level module which depends on views, and components
angular.module('pizzApp', [
    'ngRoute',
    'ui.bootstrap',
    'firebase',
    'uiGmapgoogle-maps',
    'pizzApp.login',
    'pizzApp.pizza.list',
    'pizzApp.pizza.details',
    'pizzApp.pizza.new',
    'pizzApp.pizza',
    'pizzApp.users',
    'pizzApp.users.list',
    'pizzApp.users.chat',
    'pizzApp.navigation',
    'pizzApp.user.profile'
])

// Constants
// TODO: Change Firebase URL
.constant('FBURL', 'pizza-prototype.firebaseio.com')

// Firebase Auth
.factory("Auth", ["$firebaseAuth", "FBURL",
    function ($firebaseAuth, FBURL) {
        var ref = new Firebase(FBURL);
        return $firebaseAuth(ref);
    }
])

// Configs
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/pizzas'});
}])
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //  key: 'your api key', to avoid query limit & Co.
        //  v: '3.23', defaults to latest 3.x
        //  libraries: 'weather,geometry,visualization'
    });
})

// Check if logged in
.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === 'AUTH_REQUIRED') {
            $location.path('/login');
        }
    });
}]);
