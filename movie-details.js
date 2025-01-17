const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Function to fetch movie details using the TMDb ID
async function fetchMovieDetails(id) {
  const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status_code) {
    document.getElementById('movie-details').innerHTML = `<p>Error fetching details: ${data.status_message}</p>`;
  } else {
    displayMovieDetails(data);
  }
}

// Function to display movie details on the page
function displayMovieDetails(movie) {
  const movieDetailsContainer = document.getElementById('movie-details');
  
  const title = movie.title || 'Unknown Title';
  const posterUrl = movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'default-image.jpg';
  const overview = movie.overview || 'No overview available.';
  const genres = movie.genres ? movie.genres.map(genre => genre.name).join(', ') : 'N/A';
  const releaseDate = movie.release_date || 'N/A';
  const rating = movie.vote_average ? `Rating: ${movie.vote_average}/10` : 'No rating available.';
  const runtime = movie.runtime ? `Runtime: ${movie.runtime} minutes` : 'Runtime: N/A';

  const movieDetailsHTML = `
    <div class="movie-details-content">
      <img src="${posterUrl}" alt="${title}" class="movie-poster">
      <h1>${title}</h1>
      <p><strong>Genres:</strong> ${genres}</p>
      <p><strong>Release Date:</strong> ${releaseDate}</p>
      <p><strong>Rating:</strong> ${rating}</p>
      <p><strong>Runtime:</strong> ${runtime}</p>
      <p><strong>Overview:</strong> ${overview}</p>
    </div>
  `;

  movieDetailsContainer.innerHTML = movieDetailsHTML;
}

// Function to extract the TMDb movie ID from the URL
function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');  // Extract the movie ID
  return id;
}

// When the page loads, fetch the movie details
document.addEventListener('DOMContentLoaded', () => {
  const movieId = getParamsFromURL();
  if (movieId) {
    fetchMovieDetails(movieId);  // Fetch and display movie details
  } else {
    document.getElementById('movie-details').innerHTML = '<p>No movie ID found in the URL.</p>';
  }
});
