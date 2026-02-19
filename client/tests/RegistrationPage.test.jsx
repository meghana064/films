import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegistrationPage from '../src/pages/RegistrationPage';
import LoginPage from '../src/pages/LoginPage';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Registration Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registration form renders', () => {
    renderWithRouter();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('redirect to login after registration', async () => {
    api.post.mockResolvedValueOnce({ data: { message: 'ok', redirect: '/login' } });

    renderWithRouter();

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/), { target: { value: 'TestPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email or Username')).toBeInTheDocument();
    });
  });
});
