import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface SiteContent {
  hero_name: string;
  hero_subtitle: string;
  grid_title: string;
}

const defaults: SiteContent = {
  hero_name: '武山松',
  hero_subtitle: 'Portfolio',
  grid_title: 'Selected Works',
};

export function useContent() {
  const [content, setContent] = useState<SiteContent>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const data = await api.getContent();
      setContent({ ...defaults, ...data } as SiteContent);
    } catch {
      setContent(defaults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return { content, loading, refetch: fetchContent };
}
