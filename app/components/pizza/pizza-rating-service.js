'use strict';

angular.module('pizzApp.pizza.rating.service', [])

.factory('PizzaRating', function pizzaRatingService(FBURL, $firebaseArray, $firebaseObject) {
    return {
        updateRating: function(id, vote) {
            var ref = new Firebase(FBURL + '/pizzas/' + id + '/rating');

            // create a transaction
            ref.transaction(function (currentValue) {
                var newRating = {};

                newRating['votes'] = (currentValue['votes'] || 0) + 1;
                newRating['total'] = (currentValue['total'] || 0) + vote;
                newRating['value'] = Math.round(newRating['total']/newRating['votes']);

                return newRating;
            });
        },
        createRating: function () {
            var newRating = {
                votes: 0,
                total: 0,
                value: 0
            };
            return newRating;
        }
    };
});