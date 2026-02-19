import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/home', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-netflix-red mb-2 text-center">Films</h1>
        <p className="text-gray-400 text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 text-red-200 px-4 py-2 rounded text-sm">{error}</div>
          )}
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
            required
            className="w-full px-4 py-3 bg-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-netflix-red"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            required
            className="w-full px-4 py-3 bg-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-netflix-red"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-netflix-red hover:bg-red-600 rounded font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/" className="text-netflix-red hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
