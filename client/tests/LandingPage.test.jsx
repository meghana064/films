import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../src/pages/LandingPage';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

const mockUser = { id: 1, username: 'testuser', email: 'test@test.com' };

const mockAuthSuccess = () => {
  api.get.mockImplementation((url) => {
    if (url === '/auth/me') return Promise.resolve({ data: mockUser });
    if (url === '/movies/featured')
      return Promise.resolve({
        data: { featured: { id: 1, title: 'Featured Movie', backdrop_path: 'http://img.jpg' } },
      });
    if (url === '/movies/trending')
      return Promise.resolve({
        data: {
          results: [
            { id: 1, title: 'Dynamic Movie Title', poster_path: 'http://poster.jpg' },
          ],
        },
      });
    if (url === '/movies/top-rated')
      return Promise.resolve({ data: { results: [{ id: 2, title: 'Top Rated Film', poster_path: null }] } });
    if (url === '/movies/popular')
      return Promise.resolve({ data: { results: [{ id: 3, title: 'Popular Film', poster_path: null }] } });
    return Promise.reject(new Error('Unknown URL'));
  });
};

const renderWithAuth = () => {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthSuccess();
  });

  it('movies render dynamically', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/movies/trending');
    });
  });

  it('movie title appears from API data', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText('Dynamic Movie Title')).toBeInTheDocument();
    });
  });

  it('no hardcoded movie strings - uses API response', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: mockUser });
      if (url === '/movies/featured') return Promise.resolve({ data: { featured: null } });
      if (url === '/movies/trending')
        return Promise.resolve({
          data: { results: [{ id: 99, title: 'UniqueAPI_Movie_123', poster_path: null }] },
        });
      if (url === '/movies/top-rated') return Promise.resolve({ data: { results: [] } });
      if (url === '/movies/popular') return Promise.resolve({ data: { results: [] } });
      return Promise.reject(new Error('Unknown'));
    });

    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText('UniqueAPI_Movie_123')).toBeInTheDocument();
    });
  });

  it('mock backend API and verify data rendering', async () => {
    const mockTitle = 'Mocked Backend Movie';
    api.get.mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: mockUser });
      if (url === '/movies/featured') return Promise.resolve({ data: { featured: null } });
      if (url === '/movies/trending')
        return Promise.resolve({
          data: { results: [{ id: 1, title: mockTitle, poster_path: null }] },
        });
      if (url === '/movies/top-rated') return Promise.resolve({ data: { results: [] } });
      if (url === '/movies/popular') return Promise.resolve({ data: { results: [] } });
      return Promise.reject(new Error('Unknown'));
    });

    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
  });
});
