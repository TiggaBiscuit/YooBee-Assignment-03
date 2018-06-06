function showLocations(options) {
  if (currentMarkers.length > 0) {
    clearMarkers();
  }
  placesService = new google.maps.places.PlacesService(map);
  if (!options.type) {
    throw new Error("Options object must include a type property");
  }
  if (!options.location) {
    options.location = mainPosition;
  }
  if (!options.radius) {
    options.radius = config.placesOptions.radius;
  }
  placesService.nearbySearch(options, onGetPlaces);
}

/**
* Callback for Places service
*/

function onGetPlaces(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;

  //place icon
  var icon = new google.maps.MarkerImage(
    place.icon,
    new google.maps.Size(71, 71),
    new google.maps.Point(0, 0),
    new google.maps.Point(17, 34),
    new google.maps.Size(25, 25)
  );

  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    icon: icon
  });

  //Click listener for marker
  google.maps.event.addListener(marker, "click", function() {
    if (
      !placeDetailContainer &&
      config.placesOptions &&
      config.placesOptions.detail.containerId
    ) {
      placeDetailContainer = document.querySelector(
        "#" + config.placesOptions.detail.containerId
      );
    }
    if (placeDetailContainer) {
      //This method call takes a custom callback
      getPlaceDetailHTML(place, function(html) {
        if (html) {
          placeDetailContainer.innerHTML = html;
        }
      });
    }
  });
  //Add to current markers
  currentMarkers.push(marker);
}

function getPlaceDetailHTML(place, cb) {
  placesService.getDetails(place, function(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      console.log("place", place);
      var html = `<h1>${geometry.location}</h1>``<h2>${place.name}</h2>`;
      if (place.photos && place.photos.length > 0) {
        var photoUrl = place.photos[0].getUrl(
          config.placesOptions.detail.imageDimensions
        );
        html += `<img src="${photoUrl}">`;
      }
      if (place.reviews) {
        html += `<ul>`;
        for (var i = 0; i < place.reviews.length; i++) {
          if (place.reviews[i].text) {
            html += `<li>${place.reviews[i].text}</li>`;
          }
        }
        html += `</ul>`;
      }
      //call custom callback
      cb(html);
    }
    cb(null);
  });
}

function clearMarkers() {
  for (var i = 0; i < currentMarkers.length; i++) {
    var marker = currentMarkers[i];
    marker.setMap(null);
  }
  currentMarkers = [];
}
