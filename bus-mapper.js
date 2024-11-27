const elForm = document.getElementById('bus-route-form');
const elRoute = document.getElementById('route');
const elTabularDataContainer = document.getElementById('bus-tabdata-container');
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

const addGeoJSONDataToMap = (geoJsonData) => {
  const idVal = 'trips';
  // Need to destroy existing source and layer
  // before re-creating.
  if (map.getLayer(idVal)){
    map.removeLayer(idVal);
  }
  if (map.getSource(idVal)){
    map.removeSource(idVal);
  }
  map.addSource(idVal, {
    type: 'geojson',
    data: geoJsonData
  });

  map.addLayer({
    'id': idVal,
    'source': idVal,
    'type': 'circle',
    'paint': {
        'circle-radius': 10,
        'circle-color': '#007cbf'
    }
  });
};

const epochToTimeStamp = (epoch) => {
  let date = new Date(epoch);
  return date.toLocaleString();
}

const addTabularDataToPage = (geoJsonData) => {
  const elTabularDataTBody = document.getElementById('bus-tabdata-tbody');
  elTabularDataTBody.replaceChildren();

  let counter = 0;
  geoJsonData['features'].forEach((feature) => {
    counter++;
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

    elTabularDataTBody.appendChild(elTr);
  })
}

const displayErrorMessage = (error) => {
    elTabularDataContainer.replaceChildren();
    const elErrorText = document.createElement('p');
    elErrorText.textContent = error;
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
    addGeoJSONDataToMap(geoJsonData);
    addTabularDataToPage(geoJsonData);
  } catch (error) {
    // Log error an report to user.
    console.log(error);
    displayErrorMessage(error);
  }
});
