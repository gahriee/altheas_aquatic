import { apiFetch } from './client';

export async function getDashboardStats(days = 7) {
  return apiFetch(`/api/admin/dashboard?days=${days}`);
}
