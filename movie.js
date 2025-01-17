const API_KEY = 'cb192ff121c372a06121e7173f44916c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearchQuery = '';
let loadedMovieIds = new Set();

// Array of allowed TMDb IDs
const allowedIds = [550, 299534, 140607, 120, 12345]; // Replace with your TMDb IDs

async function fetchPopularMoviesAndSeries(page = 1, query = '') {
  const movieEndpoint = query
    ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}&language=en-US`
    : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=en-US`;

  const seriesEndpoint = query
    ? `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&page=${page}&language=en-US`
    : `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}&language=en-US`;

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

  // Filter items based on allowed IDs
  const filteredItems = items.filter((item) => allowedIds.includes(item.id));

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

async function loadMoviesAndSeries(query = '', page = 1, clear = false) {
  const items = await fetchPopularMoviesAndSeries(page, query);
  displayMoviesAndSeries(items, clear);
}

// Event listeners and initialization remain the same
document.getElementById('search-button').addEventListener('click', searchMoviesAndSeries);
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchMoviesAndSeries();
});

document.getElementById('load-more-button').addEventListener('click', () => {
  currentPage++;
  loadMoviesAndSeries(currentSearchQuery, currentPage, false);
});

initializePage();
