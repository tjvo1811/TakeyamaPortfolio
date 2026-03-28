import { Photo } from '../data/portfolio.config';

// ── Auth token helpers ────────────────────────────────────────────────────────

export const getAuthToken = (): string | null => localStorage.getItem('admin_token');
export const setAuthToken = (token: string): void => localStorage.setItem('admin_token', token);
export const clearAuthToken = (): void => localStorage.removeItem('admin_token');
export const isAuthenticated = (): boolean => !!getAuthToken();

// ── Base fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json() as Promise<T>;
}

// ── API methods ───────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (password: string) =>
    apiFetch<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // Photos
  getPhotos: () => apiFetch<Photo[]>('/photos'),

  addPhoto: (photo: Omit<Photo, 'order'> & { cloudinaryPublicId?: string }) =>
    apiFetch<{ success: true }>('/photos', {
      method: 'POST',
      body: JSON.stringify(photo),
    }),

  updatePhoto: (id: string, updates: Partial<Photo & { cloudinaryPublicId?: string }>) =>
    apiFetch<{ success: true }>('/photos', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    }),

  deletePhoto: (id: string) =>
    apiFetch<{ success: true }>('/photos', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),

  // Cloudinary signed upload
  getUploadSignature: () =>
    apiFetch<{
      signature: string;
      timestamp: number;
      cloudName: string;
      apiKey: string;
      folder: string;
    }>('/upload-signature'),

  // Site content
  getContent: () => apiFetch<Record<string, string>>('/content'),

  updateContent: (updates: Record<string, string>) =>
    apiFetch<{ success: true }>('/content', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
};
