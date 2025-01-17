const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearchQuery = '';
let loadedMovieIds = new Set();

// Array of allowed TMDb IDs (Example list of movie IDs)
const allowedIds = [550, 299534, 140607, 120, 12345]; // Replace with your TMDb IDs

async function fetchMoviesByIds(ids) {
  const movieRequests = ids.map((id) =>
    fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`)
      .then((response) => response.json())
      .catch((error) => console.error('Error fetching movie data:', error))
  );

  const moviesData = await Promise.all(movieRequests);
  return moviesData.filter((movie) => movie.id); // Only include valid movie objects
}

function displayMoviesAndSeries(items, clear = false) {
  const moviesContainer = document.getElementById('movies');
  if (clear) {
    moviesContainer.innerHTML = '';
    loadedMovieIds.clear();
  }

  items.forEach((item) => {
    if (!loadedMovieIds.has(item.id)) {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <a href='/movie-details.html?id=${item.id}&type=movie'>
          <img 
            alt='${item.title}' 
            src='${item.poster_path ? IMAGE_BASE_URL + item.poster_path : 'default-image.jpg'}' 
            class="movie-image"
          >
          <h3>${item.title}</h3>
        </a>
      `;
      moviesContainer.appendChild(movieCard);
      loadedMovieIds.add(item.id);
    }
  });
}

async function loadMoviesAndSeries(ids = allowedIds, clear = false) {
  const items = await fetchMoviesByIds(ids);
  displayMoviesAndSeries(items, clear);
}

async function initializePage() {
  currentPage = 1; // Reset the page number
  currentSearchQuery = ''; // Ensure no search query is applied
  await loadMoviesAndSeries(); // Load movies by specified TMDb IDs
}

function searchMoviesAndSeries() {
  const searchInput = document.getElementById('search-input');
  currentSearchQuery = searchInput.value.trim();
  currentPage = 1; // Reset to the first page
  loadMoviesAndSeries(currentSearchQuery, true); // Use search if needed
}

// Event listeners
document.getElementById('search-button').addEventListener('click', searchMoviesAndSeries);
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchMoviesAndSeries();
});

document.getElementById('load-more-button').addEventListener('click', () => {
  currentPage++;
  loadMoviesAndSeries(currentSearchQuery, false);
});

// Initialize the page
initializePage();
