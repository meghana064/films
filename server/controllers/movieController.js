import axios from 'axios';
import config from '../config/env.js';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: config.TMDB_API_KEY },
  timeout: 10000,
});

const mapMovie = (m) => ({
  id: m.id,
  title: m.title,
  poster_path: m.poster_path ? `${IMAGE_BASE}/w500${m.poster_path}` : null,
  backdrop_path: m.backdrop_path ? `${IMAGE_BASE}/original${m.backdrop_path}` : null,
  overview: m.overview,
  release_date: m.release_date,
  vote_average: m.vote_average,
});

export const getTrending = async (req, res) => {
  try {
    const { data } = await tmdb.get('/trending/movie/week');
    const movies = (data.results || []).slice(0, 20).map(mapMovie);
    res.json({ results: movies });
  } catch (err) {
    console.error('TMDB trending error:', err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch trending movies',
      details: err.response?.data?.status_message || err.message,
    });
  }
};

export const getTopRated = async (req, res) => {
  try {
    const { data } = await tmdb.get('/movie/top_rated');
    const movies = (data.results || []).slice(0, 20).map(mapMovie);
    res.json({ results: movies });
  } catch (err) {
    console.error('TMDB top-rated error:', err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch top rated movies',
      details: err.response?.data?.status_message || err.message,
    });
  }
};

export const getPopular = async (req, res) => {
  try {
    const { data } = await tmdb.get('/movie/popular');
    const movies = (data.results || []).slice(0, 20).map(mapMovie);
    res.json({ results: movies });
  } catch (err) {
    console.error('TMDB popular error:', err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch popular movies',
      details: err.response?.data?.status_message || err.message,
    });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const { data } = await tmdb.get('/trending/movie/day');
    const featured = data.results?.[0] ? mapMovie(data.results[0]) : null;
    res.json({ featured });
  } catch (err) {
    console.error('TMDB featured error:', err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch featured movie',
      details: err.response?.data?.status_message || err.message,
    });
  }
};
