const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearchQuery = '';
let loadedMovieIds = new Set();

// List of allowed TMDb IDs (replace with your own IDs)
const allowedTMDbIDs = [12345, 67890, 111213];

// Fetch movies and TV series data
async function fetchPopularMoviesAndSeries(page = 1, query = '') {
  const movieEndpoint = query
    ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}&language=en-US`
    : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=en-US`;

  const seriesEndpoint = query
    ? `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&page=${page}&language=en-US`
    : `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}&language=en-US`;

  try {
    const [movieResponse, seriesResponse] = await Promise.all([
      fetch(movieEndpoint),
      fetch(seriesEndpoint),
    ]);

    const moviesData = await movieResponse.json();
    const seriesData = await seriesResponse.json();

    console.log('Movies Data:', moviesData);
    console.log('Series Data:', seriesData);

    return [
      ...(moviesData.results || []).map((item) => ({ ...item, type: 'movie' })),
      ...(seriesData.results || []).map((item) => ({ ...item, type: 'tv' })),
    ];
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Error fetching data. Please try again later.');
    return [];
  }
}

// Display movies and TV series
function displayMoviesAndSeries(items, clear = false) {
  const moviesContainer = document.getElementById('movies');
  if (clear) {
    moviesContainer.innerHTML = '';
    loadedMovieIds.clear();
  }

  // Filter items based on allowed TMDb IDs
  const filteredItems = items.filter((item) => allowedTMDbIDs.includes(item.id));

  if (filteredItems.length === 0) {
    if (clear) moviesContainer.innerHTML = '<p>No results found.</p>';
    return;
  }

  filteredItems.forEach((item) => {
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

// Load movies and series based on query and page
async function loadMoviesAndSeries(query = '', page = 1, clear = false) {
  const items = await fetchPopularMoviesAndSeries(page, query);
  displayMoviesAndSeries(items, clear);
}

// Search for movies and series
async function searchMoviesAndSeries() {
  const searchInput = document.getElementById('search-input');
  currentSearchQuery = searchInput.value.trim();

  if (currentSearchQuery === '') {
    alert('Please enter a search query!');
    return;
  }

  currentPage = 1;
  await loadMoviesAndSeries(currentSearchQuery, currentPage, true);

  // Update URL with search query
  history.pushState(
    { query: currentSearchQuery, page: currentPage },
    '',
    `?search=${encodeURIComponent(currentSearchQuery)}`
  );
}

// Fetch and display movie/TV details
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

    console.log('Details Data:', detailsData);
    console.log('Videos Data:', videosData);

    displayDetails(type, detailsData, videosData.results);
  } catch (error) {
    console.error('Error fetching details:', error);
    document.getElementById('movie-details').innerHTML = '<p>Error fetching details. Please try again later.</p>';
  }
}

// Display details of a movie/TV
function displayDetails(type, data, videos) {
  const container = document.getElementById('movie-details');

  const trailer = videos.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
  container.innerHTML = `
    <h1>${data.title || data.name || 'No Title Available'}</h1>
    <img 
      src="${data.poster_path ? IMAGE_BASE_URL + data.poster_path : 'default-image.jpg'}" 
      alt="${data.title || data.name}" 
      class="movie-details-image"
    >
    <p><strong>Overview:</strong> ${data.overview || 'No overview available.'}</p>
    <p><strong>Release Date:</strong> ${data.release_date || data.first_air_date || 'N/A'}</p>
    <p><strong>Rating:</strong> ${data.vote_average || 'N/A'}/10</p>
    <p><strong>Genres:</strong> ${data.genres ? data.genres.map((genre) => genre.name).join(', ') : 'N/A'}</p>
    <p><strong>Runtime:</strong> ${
      data.runtime || data.episode_run_time
        ? `${data.runtime || data.episode_run_time[0]} minutes`
        : 'N/A'
    }</p>
    <p><strong>Type:</strong> ${type === 'movie' ? 'Movie' : 'TV Series'}</p>
    ${
      trailer
        ? `<iframe width="100%" height="250" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
        : '<p>No trailer available.</p>'
    }
  `;
}

// Initialize the page on load
function initializePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery) {
    currentSearchQuery = searchQuery;
    document.getElementById('search-input').value = currentSearchQuery;
    loadMoviesAndSeries(currentSearchQuery, currentPage, true);
  } else {
    loadMoviesAndSeries(); // Load default popular movies and series
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

// Initialize page
initializePage();
