const elForm = document.getElementById('bus-route-form');
const elRoute = document.getElementById('route');
const elTabularDataContainer = document.getElementById('books-container');
const API_KEY = '772e8f7d-77d8-4c54-8e20-4630a03a1126';

const map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://demotiles.maplibre.org/style.json', // style URL
  center: [0, 0], // starting position [lng, lat]
  zoom: 1, // starting zoom
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

const displayErrorMessage = () => {
    elTabularDataContainer.replaceChildren();
    const elBookErrorText = document.createElement('p');
    elBookErrorText.textContent = "Error with request. Try another date.";
    elTabularDataContainer.appendChild(elBookErrorText);
}

elForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const routeVal = elRoute.value;
  const requestUrlObject = generateTripsForRouteUrlObject(routeVal);

  try {
    const tripsForRouteAPIData = await fetchTripsForRoutesAPIData(requestUrlObject);
    console.log(tripsForRouteAPIData);
    // updateBooksDisplay(bookAPIData, 5);
  } catch (error) {
    // Log error an report to user.
    console.log(error);
    displayErrorMessage();
  }
});
