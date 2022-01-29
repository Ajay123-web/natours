export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWpheS0xNCIsImEiOiJja3lvYzQwZzgzeHhjMm9wODB4bGdsMDJvIn0.2qoGBdHgsqbOrQxO-RMXxQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ajay-14/ckyolx736a3s414qpe1ipau0x',
    scrollZoom: false
    // center: [lng, lat],
    // zoom: 10,
    // interactive: false
  });
  //mapboxgl is a map object that is created by including the script in tour.pug

  const bounds = new mapboxgl.LngLatBounds(); //represents a rectangular geographical area on a map

  locations.forEach((loc) => {
    //CREATE MARKER
    const el = document.createElement('div');
    el.className = 'marker';

    //ADD MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //ADD POPUP
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(
        `<p>
        Day ${loc.day}: ${loc.description}
      </p>`
      )
      .addTo(map);

    //INCLUDE CURRENT LOCATION IN BOUNDS
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    //provide padding in options for a better view
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
