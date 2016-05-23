## AngularJS + Firebase: Integrazione di una chat ##

1. Partiamo dal repository https://github.com/SoNet-2016/social-prototype-maps per aggiungere la possibilità di chattare con altri utenti loggati al nostro servizio.

2. Prima di tutto andiamo su firebase per aggiungere un campo che indichi se un utente è loggato o no. Su firebase abbiamo 2 nodi: _pizzas_ e _users_. Nel secondo ci sono informazioni riguardanti i vari utenti registrati al servizio: aggiungiamo un nuovo campo "_logged_". Esso conterrà valore _true_ se l'utente è loggato, _false_ se non lo è.

3. A questo punto apriamo il nostro progetto con WebStorm e aggiungiamo un servizio che setti il campo _logged_ a true quando l'utente effettua il login ed a _false_ quando effettua il logout

    1. creiamo la cartella _users_ (posizione: app/components/users)

    2. creiamo un servizio "padre" (_users.js_) in components/users/ che dichiari la dipendenza dal servizio che vogliamo effettivamente implementare (_users-chat-login-service_)
        ```
         users.js

         'use strict';
         angular.module('pizzApp.users', [
            'pizzApp.users.chat.login.service',
         ]);
        ```

    3. creiamo il servizio _pizzApp.users.chat.login.service_ con 2 funzioni: una (_registerLogin_) per registrare il valore _true_ e l'altra (_registerLogout_) per registrare il valore _false_.
        ```
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
        ```

    4. aggiungiamo la dipendenza al servizio padre in app.js

        ```
        angular.module('pizzApp' [
        ...
        pizzApp.users,
        ...
        ])
        ```

    5. aggiungiamo la dipendenza da entrambi gli script in index.html

        ```
        <script src="components/users/users.js"></script>
        <script src="components/users/users-chat-login-service.js"></script>

        ```

    6. A questo punto dobbiamo richiamare la funzione _registerLogin_ quando l'utente effettua il login. Quindi andiamo in /app/login/login.js e la modifichiamo in questo modo:

        ```
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
        ```

    In pratica abbiamo aggiunto la dipendenza dal servizio in cui la funzione è implementata e poi richiamiamo la funzione registerLogin con _UsersChatLoginManager.registerLogin(authData.uid)_.

    7. Facciamo la stessa cosa per il logout: modifichiamo app/user-profile/user-profile.js aggiungendo la funzione logout
        ```
        $scope.logout = function () {
            UsersChatLoginManager.registerLogout(currentAuth.uid);
        };
        ```
    8. E poi la richiamiamo quando l'utente preme il pulsante logout:

        ```
        user-profile.html

        ...
        <button class="center-block btn btn-danger" ng-click="logout();auth.$unauth();">Logout</button>
        ...
        ```

4. Creiamo una "scheda" nella nostra web app che stampi l'elenco degli utenti loggati

    1. creiamo un servizio che carichi la lista degli utenti da firebase (users-service.js):
        ```
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
        ```
    2. inseriamo i vari riferimenti nel servizio padre (/app/components/users/users.js) e in index.html
    3. creiamo una nuova cartella "_users-list_" (posizione: app/users-list).
    4. creiamo il modulo della nuova vista (per il routing: il modulo verrà caricato quando viene richiamato il path _/chat_):

        ```
        users-list.js

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
        ```

    Il controller si preoccupa di caricare la lista degli utenti in una variabile "users".
    ATTENZIONE: non dimentichiamo di dichiare la dipendenza da questo modulo in app.js.

    5. Creiamo la pagina html associata in _app/users-list/users-list.html_ ed usiamo i filtri per far stampare solo gli utenti loggati e, chiaramente, non se stessi.
        ```
        <div class="row">
            <div class="col-xs-12 col-md-4">
                <ul class="media-list">
                    <li class="media" ng-repeat="user in testValue=(users | filter:{logged:true} | filter:{$id: '!' + userId})">
                        <a class="plain-link" href="#/chat/{{user.$id}}">
                            <div class="media-body">
                                <h4 class="media-heading"><strong>{{user.name}}</strong></h4>
                                <p>{{user.logged}}</p>
                            </div>
                        </a>
                        <hr/>
                    </li>
                </ul>
                <p ng-show="!testValue.length">No available users</p>
            </div>
        </div>

        ```
    Inoltre stampiamo il messaggio _No available users_ quando non ci sono utenti loggati.
    Qui abbiamo già inserito il link alla vista che ci permetterà effettivamente di chattare: "_#/chat/{{user.$id}}_"

    6. aggiungiamo un pulsante per raggiungere l'elenco degli utenti in index.html

        ```
        <footer class="navbar navbar-default navbar-fixed-bottom" nav-menu>
            ...
                <li><a href="#/chat"><span class="glyphicon glyphicon-comment"></span></a></li>
            ...
          </footer>
        ```

5. Creiamo la vista per chattare con l'utente selezionato
    1. aggiungiamo un nodo alla lista Firebase per salvare i vari messaggi:

        ```
        Esempio:

        pizza-prototype
            messages
                -KHsxHNkaRghLRQA-mL-
                    receiver: "09646c5a-bb75-4b5e-a1b2-c18cf2e1744d"
                     sender: "19da485f-ce9f-431a-85e6-5467b2b6417a"
                     senderName: "Teodoro"
                     text: "ciao"
                     utctime:  "2016-05-16-09:45:52"
        ```
    2. Creiamo un nuovo servizio (app/components/users/users-chat-service.js) per inserire un nuovo messaggio alla chat e per ottenere i messaggi esistenti
        ```
        'use strict';

        angular.module('pizzApp.users.chat.service', [])

        .factory('UsersChatService', function usersChatService(FBURL, $firebaseArray, $firebaseObject) {
            var ref = new Firebase(FBURL + '/messages');
            return {
                getMessages: function() {
                    return $firebaseArray(ref.limit(20));
                },

                getUserInfo: function(userId) {
                    var userRef = new Firebase(FBURL + '/users/'+userId);
                    return $firebaseObject(userRef);
                },
                createMessage: function(sender, senderName, receiver, text){
                    var newMessage = {};
                    newMessage['sender'] = sender;
                    newMessage['senderName'] = senderName;
                    newMessage['receiver'] = receiver;
                    newMessage['text'] = text;
                    var today = new Date();
                    var day = today.getUTCDate();
                    var month = today.getUTCMonth()+1; //January is 0!
                    var year = today.getUTCFullYear();
                    var hours = today.getUTCHours();
                    var minutes = today.getUTCMinutes();
                    var seconds = today.getUTCSeconds();

                    if(day<10) {
                        day='0'+day;
                    }

                    if(month<10) {
                        month='0'+month;
                    }
                    if(hours<10) {
                        hours='0'+hours;
                    }
                    if(minutes<10) {
                        minutes='0'+minutes;
                    }
                    if(seconds<10) {
                        seconds='0'+seconds;
                    }
                    var currentDate = year.toString()+'-'+month.toString()+'-'+day.toString()+'-'+hours.toString()+':'+minutes.toString()+':'+seconds.toString();
                    newMessage['utctime'] = currentDate;
                    return newMessage;
                },
                addMessage: function(message) {
                    return $firebaseArray(ref).$add(message);
                }
            };
        });
        ```

    3. aggiungiamo la dipendenza nel servizio padre (app/components/users/users.js) e in index.html

    4. creiamo la nuova cartella "users-chat" con il modulo _pizzApp.users.chat_ definito nel file /app/users-chat/users-chat.js

    ```
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
    ```
    Il controller si preoccuperà di a) caricare i messaggi esistenti nella variabile message b) aggiungere un nuovo messaggio quando viene richiamata la funzione _addMessage_.

    5. Creiamo la vista vera e propria che stamperà solo i messaggi scambiati tra l'utente e l'interlocutore selezionato. Nella vista, inoltre, troviamo una casella di testo con un pulsante per aggiungere nuovi messaggi.

        ```
        <div class="row">
            <div class="col-xs-12 col-md-4">
                <div id="messagesDiv">
                    <div ng-repeat="msg in messages  | orderBy:orderProp" ng-if="[userId, interlocutorId].indexOf(msg.sender) > -1 && [userId, interlocutorId].indexOf(msg.receiver) > -1 ">
                        <em>{{msg.utctime}} - {{msg.senderName}}</em>: {{msg.text}}
                    </div>
                </div>
                {{userInfo.name}}: <input type="text" ng-model="msg" ng-keydown="addMessage($event)" placeholder="Message...">
            </div>
        </div>


        ```

    6. aggiungiamo le dipendenze in app.js e in index.html
	
	
