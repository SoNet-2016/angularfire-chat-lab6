'use strict';

angular.module('pizzApp.users.service', [])

.factory('UsersService', function usersService(FBURL, $firebaseArray, $firebaseObject) {
    var ref = new Firebase(FBURL + '/users');
    return {
        getUsers: function() {
            return $firebaseArray(ref);
        }

    };
});