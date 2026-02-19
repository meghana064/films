import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../src/pages/LoginPage';
import LandingPage from '../src/pages/LandingPage';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login form renders', () => {
    renderWithRouter();
    expect(screen.getByPlaceholderText('Email or Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('redirect to landing after login', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        message: 'ok',
        user: { id: 1, username: 'test' },
        redirect: '/home',
      },
    });
    api.get.mockResolvedValue({ data: { results: [] } });

    renderWithRouter();

    fireEvent.change(screen.getByPlaceholderText('Email or Username'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'TestPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/login',
        { identifier: 'test@test.com', password: 'TestPass123' }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Trending Now')).toBeInTheDocument();
    });
  });
});
