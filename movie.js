const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Add the specific TMDb IDs you want to display
const selectedTMDbIDs = [550, 299537, 166428]; // Replace with your desired TMDb IDs
let loadedMovieIds = new Set();

async function fetchSelectedMoviesAndSeries() {
  // Fetch details for each selected ID
  const promises = selectedTMDbIDs.map(async (id) => {
    const movieEndpoint = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`;
    const seriesEndpoint = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`;

    try {
      const response = await fetch(movieEndpoint);
      if (response.ok) {
        const data = await response.json();
        return { ...data, type: 'movie' }; // Mark as a movie
      } else {
        const seriesResponse = await fetch(seriesEndpoint);
        if (seriesResponse.ok) {
          const seriesData = await seriesResponse.json();
          return { ...seriesData, type: 'tv' }; // Mark as TV series
        }
      }
    } catch (error) {
      console.error(`Error fetching details for ID ${id}:`, error);
    }
  });

  // Wait for all promises to resolve and return the results
  return Promise.all(promises);
}

function displayMoviesAndSeries(items, clear = false) {
  const moviesContainer = document.getElementById('movies');
  if (clear) {
    moviesContainer.innerHTML = '';
    loadedMovieIds.clear();
  }

  // Display only items that haven't been loaded yet
  items.forEach((item) => {
    if (item && !loadedMovieIds.has(item.id)) {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <a href='/movie-details.html?id=${item.id}&type=${item.type}'>
          <img 
            alt='${item.title || item.name}' 
            src='${item.poster_path ? IMAGE_BASE_URL + item.poster_path : 'default-image.jpg'}' 
            class="movie-image"
          >
          <h3>${item.title || item.name}</h3>
        </a>
      `;
      moviesContainer.appendChild(movieCard);
      loadedMovieIds.add(item.id);
    }
  });
}

async function initializePage() {
  // Fetch and display selected movies and TV series
  const selectedItems = await fetchSelectedMoviesAndSeries();
  displayMoviesAndSeries(selectedItems, true);
}

// Initialize the page on load
window.addEventListener('DOMContentLoaded', initializePage);
