// Constants
const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Main Page Variables
let currentPage = 1;
let currentSearchQuery = '';
let loadedMovieIds = new Set();

// Array of allowed TMDb IDs (Example list of movie IDs)
const allowedIds = [550, 299534, 140607, 120, 12345]; // Replace with your TMDb IDs

// Fetch Movies by TMDb IDs
async function fetchMoviesByIds(ids) {
  const movieRequests = ids.map((id) =>
    fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`)
      .then((response) => response.json())
      .catch((error) => console.error('Error fetching movie data:', error))
  );

  const moviesData = await Promise.all(movieRequests);
  return moviesData.filter((movie) => movie.id); // Only include valid movie objects
}

// Display Movies on Main Page
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

// Load Movies and Series
async function loadMoviesAndSeries(ids = allowedIds, clear = false) {
  const items = await fetchMoviesByIds(ids);
  displayMoviesAndSeries(items, clear);
}

// Initialize Main Page
async function initializePage() {
  currentPage = 1; // Reset the page number
  currentSearchQuery = ''; // Ensure no search query is applied
  await loadMoviesAndSeries(); // Load movies by specified TMDb IDs
}

// Search Movies and Series
function searchMoviesAndSeries() {
  const searchInput = document.getElementById('search-input');
  currentSearchQuery = searchInput.value.trim();
  currentPage = 1; // Reset to the first page
  loadMoviesAndSeries(currentSearchQuery, true); // Use search if needed
}

// Event Listeners for Main Page
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

// Movie Details Page Functions
async function fetchMovieDetails(id) {
  const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`);
  const movie = await response.json();
  return movie;
}

function displayMovieDetails(movie) {
  const movieTitle = document.getElementById('movie-title');
  const movieReleaseDate = document.getElementById('movie-release-date');
  const movieOverview = document.getElementById('movie-overview');
  const movieGenres = document.getElementById('movie-genres');
  const movieRuntime = document.getElementById('movie-runtime');
  const movieRating = document.getElementById('movie-rating');
  const moviePoster = document.getElementById('movie-poster');

  movieTitle.textContent = movie.title || 'No Title Available';
  movieReleaseDate.textContent = movie.release_date ? `Release Date: ${movie.release_date}` : 'Release Date: N/A';
  movieOverview.textContent = movie.overview || 'No overview available.';
  movieRuntime.textContent = movie.runtime ? `Runtime: ${movie.runtime} minutes` : 'Runtime: N/A';
  movieRating.textContent = movie.vote_average ? `Rating: ${movie.vote_average}/10` : 'Rating: N/A';

  // Display genres
  if (movie.genres && movie.genres.length > 0) {
    movieGenres.textContent = `Genres: ${movie.genres.map((genre) => genre.name).join(', ')}`;
  } else {
    movieGenres.textContent = 'Genres: N/A';
  }

  // Set movie poster image
  moviePoster.src = movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'default-image.jpg';
}

async function initializeMovieDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId) {
    const movie = await fetchMovieDetails(movieId);
    displayMovieDetails(movie);
  } else {
    // Handle case where no movie ID is provided (error or fallback page)
    alert('No movie ID provided');
  }
}

// Event listener to go back to the previous page on the movie details page
document.getElementById('back-button').addEventListener('click', () => {
  window.history.back();
});

// Initialize the movie details page
if (window.location.pathname.includes('movie-details.html')) {
  initializeMovieDetailsPage();
}
