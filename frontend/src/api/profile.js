import { apiFetch } from './client';

export async function fetchProfile() {
  return apiFetch('/api/profile');
}

export async function updateProfile(data) {
  return apiFetch('/api/profile', {
    method: 'POST',
    body: data,
  });
}
