import { Album, Photo } from '../data/portfolio.config';

// ── Auth token helpers ────────────────────────────────────────────────────────

export const getAuthToken = (): string | null => localStorage.getItem('admin_token');
const notifyAuthChanged = (): void => {
  window.dispatchEvent(new Event('admin-auth-change'));
};
export const setAuthToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
  notifyAuthChanged();
};
export const clearAuthToken = (): void => {
  localStorage.removeItem('admin_token');
  notifyAuthChanged();
};

function isJwtExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  if (isJwtExpired(token)) {
    clearAuthToken();
    return false;
  }
  return true;
};

// ── Base fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = isAuthenticated() ? getAuthToken() : null;
  const method = (options.method ?? 'GET').toUpperCase();
  const sendsJsonBody =
    typeof options.body === 'string' &&
    options.body.length > 0 &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (sendsJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const { headers: _ignored, ...rest } = options;
  const origin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const url = `${origin}/api${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        'Network error: the request did not complete. Check your connection, use the HTTPS site URL, or try turning off strict content blockers for this site.',
      );
    }
    throw err;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    if (res.status === 401) {
      clearAuthToken();
      throw new Error('Your admin session expired. Please log in again.');
    }
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

  // Albums
  getAlbums: () => apiFetch<Album[]>('/albums'),

  getAlbum: (id: string) =>
    apiFetch<Album>(`/albums?id=${encodeURIComponent(id)}`),

  createAlbum: (album: Omit<Album, 'order'> & { order?: number }) =>
    apiFetch<{ success: true }>('/albums', {
      method: 'POST',
      body: JSON.stringify(album),
    }),

  updateAlbum: (
    id: string,
    updates: Partial<Omit<Album, 'id'>>,
  ) =>
    apiFetch<{ success: true }>('/albums', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    }),

  deleteAlbum: (id: string) =>
    apiFetch<{ success: true }>('/albums', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};
