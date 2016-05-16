'use strict';

angular.module('pizzApp.pizza.service', [])

.factory('Pizza', function pizzaService(FBURL, $firebaseArray, $firebaseObject) {
    var ref = new Firebase(FBURL + '/pizzas');
    return {
        getPizzas: function() {
            return $firebaseArray(ref);
        },
        getPizza: function(id) {
            var pizzaRef = new Firebase(FBURL + '/pizzas/' + id);
            return $firebaseObject(pizzaRef);
        },
        createPizza: function (pizza, uid, rating) {
            var newPizza = {};
            newPizza['name'] = pizza.name;
            newPizza['pizzeria'] = pizza.pizzeria;
            newPizza['posted-by'] = uid;
            newPizza['address'] = pizza.address;
            newPizza['rating'] = rating;
            return newPizza;
        },
        postPizza: function(pizza) {
            return $firebaseArray(ref).$add(pizza);
        }
    };
});