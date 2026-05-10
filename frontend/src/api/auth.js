import { apiFetch } from './client';

export async function login(email, password) {
  return apiFetch('/api/admin/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function customerLogin(email, password) {
  return apiFetch('/api/login', {
    method: 'POST',
    body: { email, password },
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

export async function changePassword(currentPassword, newPassword, confirmPassword) {
  return apiFetch('/api/admin/profile/change-password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
  });
}

export async function forgotPassword(email) {
  return apiFetch('/api/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export async function verifyResetToken(selector, token) {
  return apiFetch('/api/verify-reset-token', {
    method: 'POST',
    body: { selector, token },
  });
}

export async function resetPassword(selector, token, newPassword, confirmPassword) {
  return apiFetch('/api/reset-password', {
    method: 'POST',
    body: { selector, token, new_password: newPassword, confirm_password: confirmPassword },
  });
}
