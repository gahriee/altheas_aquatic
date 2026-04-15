import { apiFetch } from './client';

export async function login(username, password) {
  return apiFetch('/api/admin/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function customerLogin(username, password) {
  return apiFetch('/api/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function register(data) {
  return apiFetch('/api/register', {
    method: 'POST',
    body: data,
  });
}

export async function logout() {
  return apiFetch('/api/admin/logout', {
    method: 'POST',
  });
}

export async function getMe() {
  return apiFetch('/api/admin/me');
}
