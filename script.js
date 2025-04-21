mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Sostituisci con il tuo token Mapbox

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [12.291589, 45.458853], // Centra su Venezia
    zoom: 12
});

// Aggiungi un marker alla mappa
new mapboxgl.Marker()
    .setLngLat([12.291589, 45.458853])
    .setPopup(new mapboxgl.Popup().setHTML('<h3>Venezia</h3><p>Una città unica al mondo.</p>'))
    .addTo(map);
