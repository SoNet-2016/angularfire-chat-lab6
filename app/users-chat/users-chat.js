'use strict';

angular.module('pizzApp.users.chat', ['ngRoute', 'pizzApp.users'])

// Route Config
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/chat/:userId', {
        templateUrl: 'users-chat/users-chat.html',
        controller: 'UsersChatCtrl',
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
.controller('UsersChatCtrl', ['$scope', '$log', 'UsersChatService', 'currentAuth','$routeParams',
    function($scope, $log, UsersChatService, currentAuth, $routeParams ) {
        //get the userId from currentAuth
        $scope.userId = currentAuth.uid;
        //get the interlocutor Id from the parameters contained in the url
        $scope.interlocutorId = $routeParams.userId;

        $scope.orderProp = 'utctime';
        $scope.userInfo = UsersChatService.getUserInfo($scope.userId);

        //get messages from firebase
        $scope.messages = UsersChatService.getMessages();
        //function that add a message on firebase
        $scope.addMessage = function(e) {
            if (e.keyCode != 13) return;
            //create the JSON structure that should be sent to Firebase
            var newMessage = UsersChatService.createMessage($scope.userId, $scope.userInfo.name, $routeParams.userId, $scope.msg);
            UsersChatService.addMessage(newMessage);
            $scope.msg = "";
        };
    }
]);