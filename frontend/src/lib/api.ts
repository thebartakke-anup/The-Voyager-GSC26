import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('voyager_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // In bypass mode the token is fake and the backend will reject it.
      // Only redirect to /login when we're NOT in bypass mode (i.e. a real
      // session expired).  Check for the bypass sentinel value in the token.
      const token = localStorage.getItem('voyager_token') ?? '';
      const isBypassToken = token.endsWith('.bypass');

      if (isBypassToken) {
        // Backend rejected our fake token — that's expected in bypass mode.
        // Return a resolved response with empty data so components render
        // gracefully with empty state rather than crashing or showing errors.
        return Promise.resolve({ data: [] });
      }

      // Real session expired — clear storage and redirect to login.
      localStorage.removeItem('voyager_token');
      localStorage.removeItem('voyager_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;