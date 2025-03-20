
// establish geoJSON endpoint
// geojson data for the past week
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Create feature layers for the earthquake data points
function createFeatures(earthquakeData) {
    // Define a function that runs for each feature in the features array
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}
          <hr>
          <p>Magnitude: ${feature.properties.mag}</p>
          <p>Depth: ${feature.geometry.coordinates[2]}km</p>
          <p>${new Date(feature.properties.time)}`);
   }

    function getColor(depth) {
      return depth > 80 ? 'rgb(145, 6, 6)' :
             depth > 60 ? 'rgb(247, 42, 42)' :
             depth > 40 ? 'rgb(236, 138, 47)' :
             depth > 20 ? 'rgba(236, 233, 49, 0.9)' :
                         'rgba(102, 255, 0, 0.67)';
    }

    // Create a GeoJSON layer that contains the features array
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5, // radius of the circle marker
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: '#000',
                weight: 0.8,
                opacity: 0.3,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    });

    // Create the map layer for the earthquake data
    createMap(earthquakes);
}

// Create the map object
function createMap(earthquakes) {
  // add the tile layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create the baseMaps object.
  let baseMaps = {
    "Street": street,
    "Topographical": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control and add to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend.
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    // create div
    let div = L.DomUtil.create('div', 'legend');
    // add legend content
    div.innerHTML = "<h2><center>Legend</center></h2>" +
                  "<i style='background:rgb(145, 6, 6)'></i> depth > 80 km<br>" +
                  "<i style='background:rgb(247, 42, 42)'></i> 60 - 80 km<br>" +
                  "<i style='background:rgb(236, 138, 47)'></i> 40 - 60 km<br>" +
                  "<i style='background:rgba(236, 233, 49, 0.9)'></i> 20 - 40 km<br>" +
                  "<i style='background:rgba(102, 255, 0, 0.67)'></i> O - 20 km<br>";
  
  return div;
  };
  
  legend.addTo(myMap);
}