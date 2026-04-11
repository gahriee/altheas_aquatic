import { apiFetch } from './client';

export async function login(username, password) {
  return apiFetch('/api/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function logout() {
  return apiFetch('/api/logout', {
    method: 'POST',
  });
}

export async function getMe() {
  return apiFetch('/api/me');
}
