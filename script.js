import { colorMapping } from "./colorMapping.js";

var map = L.map("map").setView([15.87, 100.9925], 6); // Centered on Thailand

// Thunderforest Transport Map basemap
L.tileLayer(
  "https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}",
  {
    attribution: "Maps © Thunderforest, Data © OpenStreetMap contributors",
    apikey: "4a98d80f4fbc47d7a4582e9f9dc26709", // Replace with your Thunderforest API key
    maxZoom: 22,
  }
).addTo(map);

// Function to get color based on "COMNAME_T" property
function getColor(comname_t) {
  return colorMapping[comname_t] || "#ff7800"; // Default color if not found
}

// Custom style for GeoJSON polygons based on "COMNAME_T"
function style(feature) {
  return {
    fillColor: getColor(feature.properties.COMNAME_T),
    weight: 2,
    opacity: 1,
    color: "black",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

// Function to bind popups with information in Thai
function onEachFeature(feature, layer) {
  var popupContent =
    "<strong>รหัสเหมือง:</strong> " +
    (feature.properties.MINE_ID || "N/A") +
    "<br><strong>สินค้า:</strong> " +
    (feature.properties.COMNAME_T || "N/A") +
    "<br><strong>จังหวัด:</strong> " +
    (feature.properties.PROVINCE || "N/A") +
    "<br><strong>ปริมาณทรัพยากร:</strong> " +
    (feature.properties.RESOURCE_N || "N/A") +
    "<br><strong>หน่วย:</strong> " +
    (feature.properties.UNIT_N || "N/A") +
    "<br><strong>พื้นที่ (ไร่):</strong> " +
    (feature.properties.RAI || "N/A");

  layer.bindPopup(popupContent);
}

// Load GeoJSON data
fetch("data/test-2.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature,
    }).addTo(map);
  })
  .catch((err) => console.error("Error loading GeoJSON data:", err));

// Custom marker icon
var customIcon = L.icon({
  iconUrl: "icons8-home-24.png", // Replace with the path to your custom icon
  iconSize: [38, 38], // Size of the icon
  iconAnchor: [22, 38], // Point of the icon which will correspond to marker's location
  popupAnchor: [-3, -38], // Point from which the popup should open relative to the iconAnchor
});

// Current location function
function locateUser() {
  map.locate({ setView: true, maxZoom: 16 });
}

function onLocationFound(e) {
  var radiusKm = 30; // Fixed radius in kilometers
  var radiusMeters = radiusKm * 1000; // Convert kilometers to meters

  L.marker(e.latlng, { icon: customIcon })
    .addTo(map)
    .bindPopup("คุณอยู่ภายใน " + radiusKm + " กิโลเมตรจากจุดนี้")
    .openPopup();

  L.circle(e.latlng, {
    radius: radiusMeters,
    color: "#aacfce", // Border color
    fillColor: "#3388ff", // Fill color
    fillOpacity: 0.1, // Fill opacity
    weight: 2, // Border width
    interactive: false, // Set interactive to false
  }).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);

document.getElementById("locate-btn").addEventListener("click", locateUser);
