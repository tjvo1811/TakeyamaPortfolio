import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Photo, portfolioConfig } from '../data/portfolio.config';

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPhotos();
      setPhotos(data);
    } catch {
      // Fallback to static config when running locally without Supabase
      setPhotos(portfolioConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return { photos, loading, error, refetch: fetchPhotos };
}
