const elForm = document.getElementById('bus-route-form');
const elRoute = document.getElementById('route');
const elTabularDataContainer = document.getElementById('books-container');
const API_KEY = '772e8f7d-77d8-4c54-8e20-4630a03a1126';

const map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://api.maptiler.com/maps/streets/style.json?key=ubJidqUs4gFgsmGfWm2W',
  center: [-122.3328, 47.6061], // starting position [lng, lat]
  zoom: 10, // starting zoom
  maplibreLogo: true
});

const generateTripsForRouteUrlObject = (routeVal) => {
  const baseUrl = 'https://api.pugetsound.onebusaway.org/api/where/trips-for-route/';
  const requestUrl = new URL(`1_${routeVal}.json`, baseUrl);
  requestUrl.searchParams.append('key', API_KEY);
  return requestUrl;
};

// REF: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
const fetchTripsForRoutesAPIData = async (urlObject) => {
  try {
    const response = await fetch(urlObject);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const json = await response.json();
    return json
  } catch (error) {
    throw error; // Rethrow the exception back up.
  }
};

// Reformat to GeoJSON spec: https://geojson.org/
const apiResponseToGeoJSON = (apiResponse) => {
  let geoJsonSubset = {
    "type":"FeatureCollection",
    "features": []
  };
  
  apiResponse['data']['list'].forEach((trip) => {
    console.log(trip);
    let pointFeature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          trip['status']['position']['lon'],
          trip['status']['position']['lat']
        ]
      },
      "properties": trip['status']
    };

    geoJsonSubset['features'].push(pointFeature);
  });

  return geoJsonSubset;
}

const displayErrorMessage = () => {
    elTabularDataContainer.replaceChildren();
    const elErrorText = document.createElement('p');
    elErrorText.textContent = "Error with request. Try another date.";
    elTabularDataContainer.appendChild(elErrorText);
}

elForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const routeVal = elRoute.value;
  const requestUrlObject = generateTripsForRouteUrlObject(routeVal);

  try {
    const tripsForRouteAPIData = await fetchTripsForRoutesAPIData(requestUrlObject);
    const geoJsonData = apiResponseToGeoJSON(tripsForRouteAPIData)
    console.log(geoJsonData);
    // updateBooksDisplay(bookAPIData, 5);
  } catch (error) {
    // Log error an report to user.
    console.log(error);
    displayErrorMessage();
  }
});
