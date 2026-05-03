import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Album, albumsConfig } from '../data/portfolio.config';

export function useAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAlbums();
      setAlbums(data);
    } catch {
      setAlbums(albumsConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return { albums, loading, error, refetch: fetchAlbums };
}
