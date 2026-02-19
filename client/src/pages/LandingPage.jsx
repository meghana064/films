import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MovieRow({ title, endpoint }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoint, { withCredentials: true })
      .then(({ data }) => setMovies(data.results || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-40 h-60 bg-gray-800 rounded animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex-shrink-0 w-40 group cursor-pointer transition transform hover:scale-105"
          >
            <img
              src={movie.poster_path || 'https://via.placeholder.com/200x300?text=No+Image'}
              alt={movie.title}
              className="w-full h-60 object-cover rounded-lg"
            />
            <p className="mt-2 text-sm text-gray-300 truncate group-hover:text-white">{movie.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    api.get('/movies/featured', { withCredentials: true })
      .then(({ data }) => setFeatured(data.featured))
      .catch(() => setFeatured(null));
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black">
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-bold text-netflix-red">Films</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{user?.username}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-netflix-red hover:bg-red-600 rounded text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <section className="relative h-[70vh] min-h-[400px] flex items-end pb-16">
        {featured && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${featured.backdrop_path || featured.poster_path})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-black/50 to-transparent" />
            <div className="relative z-10 px-6 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{featured.title}</h2>
              <p className="text-gray-300 text-lg line-clamp-3">{featured.overview}</p>
            </div>
          </>
        )}
        {!featured && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">Loading featured movie...</p>
          </div>
        )}
      </section>

      <main className="px-6 -mt-24 relative z-10">
        <MovieRow title="Trending Now" endpoint="/movies/trending" />
        <MovieRow title="Top Rated" endpoint="/movies/top-rated" />
        <MovieRow title="Popular" endpoint="/movies/popular" />
      </main>
    </div>
  );
}
