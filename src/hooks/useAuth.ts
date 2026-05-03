import { useEffect, useState } from 'react';
import { api, setAuthToken, clearAuthToken, isAuthenticated } from '../lib/api';

export function useAuth() {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncAuthState = () => setAuthed(isAuthenticated());

    window.addEventListener('admin-auth-change', syncAuthState);
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('admin-auth-change', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  const login = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.login(password);
      setAuthToken(token);
      setAuthed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setAuthed(false);
  };

  return { authed, loading, error, login, logout };
}
