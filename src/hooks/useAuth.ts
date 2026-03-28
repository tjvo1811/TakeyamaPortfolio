import { useState } from 'react';
import { api, setAuthToken, clearAuthToken, isAuthenticated } from '../lib/api';

export function useAuth() {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
