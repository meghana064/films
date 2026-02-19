import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
      setUser(data.user);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me', { withCredentials: true });
      setUser(data);
      return true;
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
        const refreshed = await refreshToken();
        return refreshed;
      }
      setUser(null);
      return false;
    }
  }, [refreshToken]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const isAuth = await checkAuth();
      if (!mounted) return;

      const isProtected = location.pathname === '/home' || location.pathname.startsWith('/home');
      const isAuthPage = location.pathname === '/login' || location.pathname === '/';

      if (isAuth && isAuthPage) {
        navigate('/home', { replace: true });
      } else if (!isAuth && isProtected) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          navigate('/login', { replace: true });
        }
      }

      setLoading(false);
    };

    init();
    return () => { mounted = false; };
  }, [location.pathname, checkAuth, refreshToken, navigate]);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password }, { withCredentials: true });
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload, { withCredentials: true });
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
