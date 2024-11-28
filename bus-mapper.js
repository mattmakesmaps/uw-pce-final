/**
 * BEGIN GLOBALS
 */

const elBtnCancelAutoRefresh = document.getElementById('cancel-refresh');
const elErrorText = document.getElementById('error-text');
const elForm = document.getElementById('bus-route-form');
const elRefreshText = document.getElementById('refresh-text');
const elRoute = document.getElementById('route');

const API_KEY = '772e8f7d-77d8-4c54-8e20-4630a03a1126';

const mapIDVal = 'trips';

let intervalIDs = {
  'processing': null,
  'decrementBySeconds': null
};

/**
 * END GLOBALS
 */

/**
 * BEGIN API FETCH AND JSON DATA MANIPULATION CODE
 */

const generateURLObjectTripsForRoute = (routeVal) => {
  const baseUrl = 'https://api.pugetsound.onebusaway.org/api/where/trips-for-route/';
  const requestUrl = new URL(`1_${routeVal}.json`, baseUrl);
  requestUrl.searchParams.append('key', API_KEY);
  return requestUrl;
};

// REF: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
const fetchAPIDataTripsForRoute = async (urlObject) => {
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
const reformatAPIResponseToGeoJSON = (apiResponse) => {
  let geoJsonSubset = {
    "type":"FeatureCollection",
    "features": []
  };
  
  apiResponse['data']['list'].forEach((trip) => {
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
};

/**
 * END API FETCH AND JSON DATA MANIPULATION CODE
 */

/**
 * BEGIN UI RELATED DISPLAY CODE
 */

const epochToTimeStamp = (epoch) => {
  let date = new Date(epoch);
  return date.toLocaleString();
};

const makePopulatedTableRow = (counter, feature) => {
    let elTr = document.createElement('tr');
    let thIndex = document.createElement('th');
    thIndex.textContent = counter;
    let tdVehicleId = document.createElement('td');
    tdVehicleId.textContent = feature['properties']['vehicleId'];
    let tdLocation = document.createElement('td');
    tdLocation.textContent = epochToTimeStamp(feature['properties']['lastLocationUpdateTime']);
    let tdPhase = document.createElement('td');
    tdPhase.textContent = feature['properties']['phase'];
    let tdDistance = document.createElement('td');
    tdDistance.textContent = feature['properties']['distanceAlongTrip'].toFixed(2);
    let tdDeviation = document.createElement('td');
    tdDeviation.textContent = feature['properties']['scheduleDeviation'];

    elTr.appendChild(thIndex);
    elTr.appendChild(tdVehicleId);
    elTr.appendChild(tdLocation);
    elTr.appendChild(tdPhase);
    elTr.appendChild(tdDistance);
    elTr.appendChild(tdDeviation);
    return elTr;
};

const addTabularDataToPage = (geoJsonData) => {
  const elTabularDataTBody = document.getElementById('bus-tabdata-tbody');
  elTabularDataTBody.replaceChildren();

  // Sort table by last updated date to add some dynamic behavior.
  // REF: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
  geoJsonData['features'].sort((a,b) => {
    return b['properties']['lastLocationUpdateTime'] - a['properties']['lastLocationUpdateTime'];
  });

  let counter = 0;
  geoJsonData['features'].forEach((feature) => {
    counter++;
    elTabularDataTBody.appendChild(makePopulatedTableRow(counter, feature));
  })
};

const displayErrorMessage = (error) => {
  elErrorText.replaceChildren();
  const elErrorMessage = document.createElement('p');
  elErrorMessage.textContent = error;
  elErrorText.appendChild(elErrorMessage);
};

/**
 * END UI RELATED DISPLAY CODE
 */

/**
 * BEGIN NON-MAP EVENT LISTENERS AND HELPERS
 */
const updateCountdownTimer = (timeIntervalMS) => {
  let remainingTimeSeconds = timeIntervalMS / 1000;

  intervalIDs['decrementBySeconds'] = setInterval(() => {
    if (remainingTimeSeconds > 0) {
      remainingTimeSeconds--;
      const timeUIString = `Auto-Refresh Status: ${remainingTimeSeconds} Seconds`;
      elRefreshText.textContent = timeUIString;
    }
  }, 1000);
};

const cleanupAllIntervalCalls = (intervalIDs) => {
  Object.values(intervalIDs).forEach((intervalId) => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  })
};

const fetchAndProcessData = async (requestUrlObject) => {
  try {
    elErrorText.replaceChildren();
    const tripsForRouteAPIData = await fetchAPIDataTripsForRoute(requestUrlObject);
    const geoJsonData = reformatAPIResponseToGeoJSON(tripsForRouteAPIData)
    addGeoJSONDataToMap(geoJsonData);
    addTabularDataToPage(geoJsonData);
  } catch (error) {
    // Log error an report to user.
    console.log(error);
    displayErrorMessage(error);
  }
};

elForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  cleanupAllIntervalCalls(intervalIDs);

  const routeVal = elRoute.value;
  const requestUrlObject = generateURLObjectTripsForRoute(routeVal);

  // Need to fire once outside of set interval to execute immediately.
  const timeoutIntervalMS = 15000;
  fetchAndProcessData(requestUrlObject)
  updateCountdownTimer(timeoutIntervalMS)

  // Need to wrap call to `fetchAndProcessData` in an anonymous function
  // to negate `Uncaught SyntaxError: Unexpected identifier 'Promise'`.
  intervalIDs['processing'] = setInterval(() => {
    fetchAndProcessData(requestUrlObject)
    updateCountdownTimer(timeoutIntervalMS)
  }, timeoutIntervalMS);

});

elBtnCancelAutoRefresh.addEventListener('click', () => {
  cleanupAllIntervalCalls(intervalIDs);
  elRefreshText.textContent = 'Auto-Refresh Status: Disabled'
});

/**
 * END NON-MAP EVENT LISTENERS AND HELPERS
 */

/**
 * BEGIN MAP-SPECIFIC SETUP AND EVENT LISTENER
 */

const map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://api.maptiler.com/maps/streets/style.json?key=ubJidqUs4gFgsmGfWm2W',
  center: [-122.3328, 47.6061], // starting position [lng, lat]
  zoom: 10, // starting zoom
  maplibreLogo: true
});

const addGeoJSONDataToMap = (geoJsonData) => {
  // Need to destroy existing source and layer
  // before re-creating.
  if (map.getLayer(mapIDVal)){
    map.removeLayer(mapIDVal);
  }
  if (map.getSource(mapIDVal)){
    map.removeSource(mapIDVal);
  }
  map.addSource(mapIDVal, {
    type: 'geojson',
    data: geoJsonData
  });

  map.addLayer({
    'id': mapIDVal,
    'source': mapIDVal,
    'type': 'circle',
    'paint': {
        'circle-radius': 10,
        'circle-color': '#007cbf',
        'circle-stroke-color': 'black',
        'circle-stroke-width': 2
    }
  });
};

// REF: https://maplibre.org/maplibre-gl-js/docs/examples/popup-on-click/
// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', mapIDVal, (e) => {
  const coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.vehicleId;

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
});

/**
 * END MAP-SPECIFIC SETUP AND EVENT LISTENER
 */