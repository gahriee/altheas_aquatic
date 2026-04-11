import { apiFetch } from './client';

/**
 * ----------------------------------------
 * getAllCategories
 * ----------------------------------------
 * Fetch all categories for product forms.
 */
export async function getAllCategories() {
  return await apiFetch('/api/admin/categories');
}
