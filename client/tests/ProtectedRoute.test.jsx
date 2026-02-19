import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import LoginPage from '../src/pages/LoginPage';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

describe('Protected Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('protected route blocks unauthenticated users', async () => {
    api.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email or Username')).toBeInTheDocument();
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
