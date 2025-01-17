const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearchQuery = '';
let loadedMovieIds = new Set();

async function fetchMoviesAndSeries(page = 1, query = '') {
  const movieEndpoint = query
    ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}&language=en-US`
    : `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}&language=en-US&region=IN`;

  const seriesEndpoint = query
    ? `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&page=${page}&language=en-US`
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_origin_country=IN&air_date.gte=2025-01-01&page=${page}&language=en-US`;

  const [movieResponse, seriesResponse] = await Promise.all([
    fetch(movieEndpoint),
    fetch(seriesEndpoint),
  ]);

  const moviesData = await movieResponse.json();
  const seriesData = await seriesResponse.json();

  return [
    ...(moviesData.results || []).map((item) => ({ ...item, type: 'movie' })),
    ...(seriesData.results || []).map((item) => ({ ...item, type: 'tv' })),
  ];
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

async function loadMoviesAndSeries(query = '', page = 1, clear = false) {
  const items = await fetchMoviesAndSeries(page, query);
  displayMoviesAndSeries(items, clear);
}

async function searchMoviesAndSeries() {
  const searchInput = document.getElementById('search-input');
  currentSearchQuery = searchInput.value.trim();
  if (currentSearchQuery === '') {
    alert('Please enter a search query!');
    return;
  }
  currentPage = 1;
  await loadMoviesAndSeries(currentSearchQuery, currentPage, true);

  // Push the search query into history to avoid showing search again when going back
  history.pushState({ query: currentSearchQuery, page: currentPage }, '', `?search=${encodeURIComponent(currentSearchQuery)}`);
}

function getParamsFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    id: urlParams.get('id'),
    type: urlParams.get('type')
  };
}

async function fetchDetails(type, id) {
  const detailsEndpoint = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`;
  const videosEndpoint = `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`;

  try {
    const [detailsResponse, videosResponse] = await Promise.all([
      fetch(detailsEndpoint),
      fetch(videosEndpoint),
    ]);

    const detailsData = await detailsResponse.json();
    const videosData = await videosResponse.json();

    displayDetails(type, detailsData, videosData.results);
  } catch (error) {
    document.getElementById('movie-details').innerHTML = '<p>Error fetching details. Please try again later.</p>';
  }
}

function displayDetails(type, data, videos) {
  const container = document.getElementById('movie-details');

  const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
  container.innerHTML = `
    <h1>${data.title || data.name || "No Title Available"}</h1>
    <img 
      src="${data.poster_path ? IMAGE_BASE_URL + data.poster_path : ''}" 
      alt="${data.title || data.name}" 
      class="movie-details-image"
    >
    <p><strong>Overview:</strong> ${data.overview || "No overview available."}</p>
    <p><strong>Release Date:</strong> ${data.release_date || data.first_air_date || "N/A"}</p>
    <p><strong>Rating:</strong> ${data.vote_average || "N/A"}/10</p>
    <p><strong>Genres:</strong> ${data.genres ? data.genres.map(genre => genre.name).join(', ') : "N/A"}</p>
    <p><strong>Runtime:</strong> ${data.runtime || data.episode_run_time ? `${data.runtime || data.episode_run_time[0]} minutes` : "N/A"}</p>
    <p><strong>Type:</strong> ${type === 'movie' ? 'Movie' : 'TV Series'}</p>
    ${
      trailer
        ? `<iframe width="100%" height="250" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : '<p>No trailer available.</p>'
    }
  `;
}

// Handle back/forward navigation with history state
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.query) {
    // If there's a search query in the history, load the previous search results
    currentSearchQuery = event.state.query;
    currentPage = event.state.page;
    document.getElementById('search-input').value = currentSearchQuery;
    loadMoviesAndSeries(currentSearchQuery, currentPage, true);
  } else {
    // If no search query in history, load the default (home) page
    currentSearchQuery = '';  // Set to empty string to load home
    currentPage = 1;  // Reset to the first page
    loadMoviesAndSeries();  // Load default posts
  }
});

// Initialize page based on URL parameters (when user refreshes or lands on the page)
function initializePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery) {
    currentSearchQuery = searchQuery;
    document.getElementById('search-input').value = currentSearchQuery;
    loadMoviesAndSeries(currentSearchQuery, currentPage, true);
  } else {
    loadMoviesAndSeries(); // Load default page if no search query
  }
}

// Event listeners
document.getElementById('search-button').addEventListener('click', searchMoviesAndSeries);
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchMoviesAndSeries();
});

document.getElementById('load-more-button').addEventListener('click', () => {
  currentPage++;
  loadMoviesAndSeries(currentSearchQuery, currentPage, false);
});

// Initialize the page on load
initializePage();
