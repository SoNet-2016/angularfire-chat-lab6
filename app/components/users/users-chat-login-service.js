'use strict';

angular.module('pizzApp.users.chat.login.service', [])

.factory('UsersChatLoginManager', function usersChatLoginManager(FBURL, $firebaseArray, $firebaseObject) {
    return {
        registerLogin: function(uid) {
            var ref = new Firebase(FBURL + '/users/' + uid + '/logged');

            // create a transaction
            ref.transaction(function () {
                return true;
            });
        },
        registerLogout: function(uid) {
            var ref = new Firebase(FBURL + '/users/' + uid + '/logged');

            // create a transaction
            ref.transaction(function () {
                return false;
            });
        }
    };
});