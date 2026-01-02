const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function getToken() {
  try {
    return localStorage.getItem('admin_token') || '';
  } catch {
    return '';
  }
}

export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const useAuth = options.auth === true;
  if (useAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export { API_BASE };