import { apiFetch } from './client';

/**
 * ----------------------------------------
 * STOREFRONT API
 * ----------------------------------------
 */

/**
 * Fetch all categories for storefront filtering.
 */
export const getCategories = async () => {
  const response = await apiFetch('/api/storefront/categories');
  return response.categories;
};

/**
 * ----------------------------------------
 * ADMIN API
 * ----------------------------------------
 */

/**
 * Fetch all categories for admin product forms.
 */
export async function getAllCategories() {
  const response = await apiFetch('/api/admin/categories');
  return response; // Adjust based on how admin expects it, standardizing to return the data directly
}
