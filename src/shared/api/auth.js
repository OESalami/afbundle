import { apiRequest } from './client'

export async function login(email, password) {
  const { token } = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  try {
    localStorage.setItem('admin_token', token);
  } catch {}
  return token;
}

export function logout() {
  try {
    localStorage.removeItem('admin_token');
  } catch {}
}

export async function me() {
  const { user } = await apiRequest('/auth/me', { auth: true });
  return user;
}