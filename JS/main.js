$(function() {
  var locations = $("#locations-dropdown");

  //Set Up Map

  var map,
    mapCanvas,
    mainPosition,
    onNaviMode,
    naviDestination,
    currentInfowindow,
    iterator,
    locationJSON,
    markers,
    routeMarkers,
    stepDisplay,
    locations = $("#locations-dropdown");

  google.maps.event.addDomListener(window, "load", function() {
    init();

    locations.on("change", function() {
      var config = {
        type: [this.value]
      };
      showLocations(config);
    });
  });
});

var directionsService;
var directionsDisplay;
var currentMarkers = [];
var placesService;
var placeDetailContainer;
var config = {
  geolocation: true,
  placesOptions: {
    radius: 4000,
    detail: {
      containerId: "place-detail",
      imageDimensions: {
        maxWidth: 400,
        maxHeight: 500
      }
    }
  }
};

function init() {
  routeMarkers = [];
  locationJSON = {};
  onNaviMode = false;
  naviDestination = null;
  currentInfowwindow = new google.maps.InfoWindow();
  directionsService = new google.maps.DirectionsService();
  stepDisplay = new google.maps.InfoWindow();

  //Map

  mapCanvas = document.getElementById("mapCanvas");
  //There are two required options for every map: center and zoom. Center is not required because we're going to pan to position.
  var mapOptions = {
    zoom: 12
  };
  //Create map inside given HTML container
  map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
  //Center marker is located at Christchurch City Council
  mainPosition = new google.maps.LatLng(-43.531918, 172.631438);
  var marker = new google.maps.Marker({
    map: map,
    position: mainPosition,
    title: "Christchurch City Council"
  });

  //Changes the center of the map to the given LatLng.
  map.panTo(mainPosition);
  markers = [];
  markers.push(marker);

  //Directions Display

  var rendererOptions = {
    map: map
  };
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  directionsDisplay.setMap(map);
  //Create directions display inside given HTML container
  directionsDisplay.setPanel(document.getElementById("directionsPanel"));
}

/**
 * Set the default location. Used on click of the home button.
 */

function setDefaultLocation() {
  // Christchurch City Council
  mainPosition = new google.maps.LatLng(-43.531918, 172.631438);
  map.setCenter(mainPosition);
  markers[0].position = mainPosition;
  markers[0].title = "Christchurch City Council";
  if (onNaviMode) {
    calcRoute();
  } else {
    markers[0].setMap(map);
  }
}

/**
 * HTML5 Geolocation
 */

function shareCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      showCurrentLocation,
      showGeolocationError
    );
  } else {
    mapCanvas.innerHTML = "Geolocation is not supported by this browser.";
  }
}

/**
 * Set current Geolocation position to map.
 */

function showCurrentLocation(position) {
  mainPosition = new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude
  );
  map.setCenter(mainPosition);
  markers[0].position = mainPosition;
  markers[0].title = "Your current position";
  if (onNaviMode) {
    calcRoute();
  } else {
    markers[0].setMap(map);
  }
}

/**
 * Handle HTML5 Geolocation Error.
 */

function showGeolocationError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      mapCanvas.innerHTML = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      mapCanvas.innerHTML = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      mapCanvas.innerHTML = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      mapCanvas.innerHTML = "An unknown error occurred.";
      break;
  }
}

/**
 * Get the location JSON and drop markers for each JSON location object.
 * Called on click of each location menu item, i.e. "Restaurants", etc.
 */

dropRegularMarkers = function(id) {
  locationJSON = {};
  $.getJSON("json/" + id + ".json", function(json) {
    locationJSON = json;
    dropMarkers(locationJSON.locations, false);
  });
};

/**
   * Drop markers for each item in array.
   */

function dropMarkers(arr) {
  //Clean up first
  clearRoute();
  clearCustomMarkers();
  for (var i = 0; i < arr.length; i++) {
    setTimeout(function() {
      dropCustomMarkers();
    }, i * 200);
  }
}

dropCustomMarkers = function() {
  var location = locationJSON.locations[iterator];
  var locationInfoHtml = location.html;
  //get the html for the infoWindow from the JSON object.
  var image = {
    url: locationJSON.locations[iterator].image.url,
    size: new google.maps.Size(location.image.size[0], location.image.size[1]),
    origin: new google.maps.Point(
      location.image.origin[0],
      location.image.origin[1]
    ),
    anchor: new google.maps.Point(
      location.image.anchor[0],
      location.image.anchor[1]
    )
  };
  var marker = new google.maps.Marker({
    title: location.title,
    position: new google.maps.LatLng(location.latitude, location.longitude),
    map: map,
    icon: image,
    shape: location.shape,
    zIndex: location.zIndex,
    draggable: false,
    animation: google.maps.Animation.DROP
  });
  var infoWindow = new google.maps.InfoWindow({
    content: locationInfoHtml,
    maxWidth: 200
  });

  google.maps.event.addListener(marker, "click", function() {
    infoWindow.close(infoWindow);
    infoWindow.open(map, marker);
    naviDestination = marker.getPosition();
    onNaviMode = true;
    calcRoute();
  });
  google.maps.event.addListener(infoWindow, "closeClick", function() {
    onNaviMode = false;
    clearRoute();
  });
  markers.push(marker);
  iterator++;
};

function clearCustomMarkers() {
  iterator = 0;
  for (var i = 1; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.splice(1, markers.length - 1);
}

/**
 * Clear existing routes
 */

  function clearRoute() {
    for (var i = 0; i < routeMarkers.length; i++) {
      routeMarkers[i].setMap(null);
    }
    routeMarkers = [];
    directionsDisplay.setDirections({ routes: [] });
    markers[0].setMap(map);
  };

/**
   * Clear any existing routes and calculate the new route using the DirectionsService route() method.
   */

function calcRoute() {
  clearRoute();
  var request = {
    origin: mainPosition,
    //naviDestination will be the position of the marker that was clicked
    destination: naviDestination,
    travelMode: google.maps.TravelMode.DRIVING
  };
  // Route the directions and pass the response to a
  //function to create markers for each step.
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      showSteps(response);
    }
  });
  markers[0].setMap(null);
}

/**
 * Handle the response directions for the DirectionsService route() method callback.
 */

function showSteps(directionResult) {
  //For each step, place a marker, and add the text to the marker's info window.
  //Also attach the marker to an array so we can keep track of it and remove it when calculating new routes.
  var myRoute = directionResult.routes[0].legs[0];
  for (var i = 0; i < myRoute.steps.length; i++) {
    var marker = new google.maps.Marker({
      position: myRoute.steps[i].start_location,
      map: map
    });
    attachInstructionText(marker, myRoute.steps[i].instructions);
    routeMarkers[i] = marker;
  }
}
