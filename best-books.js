const formEl = document.getElementById('best-books-form');
const yearEl = document.getElementById('year');
const monthEl = document.getElementById('month');
const dateEl = document.getElementById('date');

const API_KEY = 'rYl0EQGFeybTL4EgiFua4HyUwh54sBFz';

const generateBookAPIUrlObject = (year, month, date) => {
  const baseUrl = 'https://api.nytimes.com/svc/books/v3/lists/';
  const listParameter = 'hardcover-fiction';
  const requestUrl = new URL(`${year}-${month}-${date}/${listParameter}.json`, baseUrl);
  requestUrl.searchParams.append('api-key', API_KEY);
  return requestUrl;
};

// REF: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
const fetchBookAPIData = async (urlObject) => {
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

const updateBooksDisplay = (bookAPIData, numBooks) => {
  let topNBooks = bookAPIData.results.books.slice(0, numBooks);
  const elBooksContainer = document.getElementById('books-container');
  // clear the container
  elBooksContainer.replaceChildren();

  topNBooks.forEach((book) => {
    const elBookDiv = document.createElement('div');
    const elBookTitle = document.createElement('h3');
    elBookTitle.textContent = book['title'];
    const elBookAuthor = document.createElement('p');
    elBookAuthor.textContent = `Author: ${book['author']}`;
    const elBookDescription = document.createElement('p');
    elBookDescription.textContent = `Description: ${book['description']}`;
    const elBookImage = document.createElement('img');
    elBookImage.src = book['book_image'];

    elBookDiv.appendChild(elBookTitle);
    elBookDiv.appendChild(elBookAuthor);
    elBookDiv.appendChild(elBookDescription);
    elBookDiv.appendChild(elBookImage);
    elBooksContainer.appendChild(elBookDiv);
  })

}

elForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const year = yearEl.value;
  const month = monthEl.value;
  const date = dateEl.value;

  // Fetch bestselling books for date and add top 5 to page
  const requestUrlObject = generatTripsForRouteUrlObject(year, month, date);
  try {
    const bookAPIData = await fetchTripsForRoutesAPIData(requestUrlObject);
    updateBooksDisplay(bookAPIData, 5);
  } catch (error) {
    // Log error an report to user.
    console.log(error);
    const elBooksContainer = document.getElementById('books-container');
    elBooksContainer.replaceChildren();
    const elBookErrorText = document.createElement('p');
    elBookErrorText.textContent = "Error with request. Try another date.";
    elBooksContainer.appendChild(elBookErrorText);
  }
});
