## Add the pizza rating functionality (with AngularFire) ##

1. Add a `pizza-rating-service.js`, in the `components\pizza` folder, to perform the rating of pizzas through Firebase [transaction](https://www.firebase.com/docs/web/api/firebase/transaction.html).

2. Add a rating widget in the `pizza-details.html` view to allow users vote a specific pizza, e.g., by exploiting the `uib-rating` tag provided by the (already) included [Bootstrap directive](https://angular-ui.github.io/bootstrap/).

    ```
    <uib-rating class="star-color star-large" ng-model="pizza.rating.value" aria-labelledby="default-rating" ng-click="setRating()" read-only="voteSaved"></uib-rating>
    ```

3. In the `pizza-details.js` controller, add a `setRating()` function that will call the only function of the just created `PizzaRating` service.

    ```
    $scope.setRating = function(){
        PizzaRating.updateRating($routeParams.pizzaId, $scope.pizza.rating.value);
        $scope.voteSaved = true;
    };
    ```


## Add a new pizza to Pizza++ (with AngularFire) ##

1. Add a `pizza-creation` controller and view, showing an HTML form and an empty controller

2. Since AngularJS does not support natively `<input type="file"...>`, download and add to the `index.html` the [ng-file-upload](https://github.com/danialfarid/ng-file-upload) directive

    ```
    <!-- File Upload -->
    <script src="../lib/ng-file-upload-shim.min.js"></script> <!-- for no html5 browsers support -->
    <script src="../lib/ng-file-upload.min.js"></script>
    ```

   As an alternative, you can use directly HTML5 + plain JS (but the event triggered by clicking on the `<input>` tag cannot be handled in the AngularJS controller).

3. Tell the `pizza-creation.html` form to submit with a JavaScript function called `addNewPizza()` (to be added in the controller).

    ```
    ...
    <form id="frmPizza" role="form" ng-submit="addNewPizza()">
    ...
    ```

4. Since we want to get a photo from the smartphone camera, edit the `<input type="file"...>` to support such a functionality (with `ng-file-upload`):

    ```
    <button type="file" class="btn btn-default btn-lg" id="imgPizza" ng-model="pizza.img" ngf-accept="'image/*'" ngf-capture="camera" ngf-select="add()" >
        <span class="glyphicon glyphicon-camera"></span>
    </button>
    ```

    `ngf-accept`, `ngf-capture`, and `ngf-select` are the ng-file-upload equivalent of the HTML5 `accept`, `capture`, and `onselect` attributes. They allow to process these attributes in the AngularJS controller.

5. The `ngf-select` specifies an `add()` function. Add this function in the `pizza-creation.js` controller. It is useless in our case, but it is *mandatory* to support the process of getting a photo from the mobile camera.

    ```
     $scope.add = function () {
        $log.info($scope.pizza.img);
    };
    ```

6. Add the function to submit the entire form in the `pizza-creation.js` controller:

    ```
    $scope.addNewPizza = function () {
        var newRating = PizzaRating.createRating();
        var newPizza = Pizza.createPizza($scope.pizza, currentAuth.uid, newRating);

        Upload.base64DataUrl($scope.pizza.img).then(function (base64Url) {
            newPizza['image'] = base64Url;
            Pizza.postPizza(newPizza).then(function () {
                $location.path("/pizzas");
            });
        });
    };
    ```

    The `Upload.base64DataUrl()` function is provided by `ng-file-upload` and convert an image in its base64 representation. It is a "trick" to store images in the Firebase JSON. The function has a promise (the `then()` function) that is called when the convertion has been performed.


## Integrating Google Maps in Pizza++ (with AngularFire) ##

1. Download and include into the `index.html` the [angular-google-maps](https://angular-ui.github.io/angular-google-maps) directive to integrate Google Maps into AngularJS:

    ```
    <script src="../lib/google-maps/lodash.js"></script>
    <script src="../lib/google-maps/angular-simple-logger.js"></script>
    <script src="../lib/google-maps/angular-google-maps.min.js"></script>
    ```

2. Add the just included set of directives (`uiGmapgoogle-maps`) to the main module of our application (`app.js`).

3. [*Optionally*] Add configuration parameters for Google Maps

    ```
    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            //  key: 'your api key', to avoid query limit & Co.
            //  v: '3.23', defaults to latest 3.x
            //  libraries: 'weather,geometry,visualization'
        });
    })
    ```

4. Add the Google Maps directive to the `pizza-list.html` view (in a dedicated `div`):

    ```
    <div class="col-xs-12 col-md-8 map-container">
        <ui-gmap-google-map center="map.center" zoom="map.zoom" >
        </ui-gmap-google-map>
    </div>
    ```

5. Update the CSS to allow the embedded map to be "truly" responsive.

6. Add a container for markers inside the `ui-gmap-google-map`:

    ```
    ...
    <ui-gmap-markers models="pizzaMarkers" coords="'self'" icon="'icon'" >
        <ui-gmap-windows show="show">
            <div ng-non-bindable>{{title}}</div>
        </ui-gmap-windows>
    </ui-gmap-markers>
    ...
    ```

7. Create the map and the markers in the `pizza-list.js` controller, starting from the data available from Firebase:

    ```
    $scope.pizzaMarkers = [];

    // When the pizza list has been loaded completely from Firebase...
    $scope.pizzas.$loaded().then(function () {
        // When Google Maps is ready...
        uiGmapGoogleMapApi.then(function(maps) {
            // init
            $scope.pizzaMarkers= [];
            var geocoder = new maps.Geocoder();

            // create the map
            $scope.map = { center: { latitude: 45.06, longitude: 7.67 }, zoom: 14 };

            // create the markers on the map
            for (var i = 0; i < $scope.pizzas.length; i++) {
                createMarker(i, $scope.pizzas[i], geocoder);
            }
        });
    });
    ```

    Remember to add `uiGmapGoogleMapApi` in the controller's dependecies!

8. Add a function, in the `pizza-list.js` controller, to create a *single* marker in the map:

    ```
    var createMarker = function (index, pizzaInfo, geocoder) {
        // geocode function: get an address from GPS coordinates
        geocoder.geocode({'address': pizzaInfo.address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var marker = {
                    latitude: results[0].geometry.location.lat(),
                    longitude: results[0].geometry.location.lng(),
                    title: pizzaInfo.pizzeria
                };
                marker['id'] = index; // mandatory id
                $scope.pizzaMarkers.push(marker);
            } else {
                $log.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
    ```

    The `geocode()` function get an address (street name *and* city) and try to convert it into GPS coords. The reverse function is also available, if needed.

9. Perform the same operation for the `pizza-detail` controller and view. To load a *single* marker in the HTML instead of a collection of them, you can use the `<ui-gmap-marker>` tag.

    ```
    <ui-gmap-marker coords="marker.coords" idkey="0"></ui-gmap-marker>
    ```