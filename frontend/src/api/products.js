import { apiFetch } from './client';

/**
 * ----------------------------------------
 * STOREFRONT API
 * ----------------------------------------
 */

/**
 * Fetch all active products (storefront view).
 * Can be filtered by categoryId.
 */
export const getProducts = async (categoryId = null) => {
  const url = categoryId ? `/api/storefront/list?category=${categoryId}` : '/api/storefront/list';
  const response = await apiFetch(url);
  return response.products;
};

/**
 * Fetch a single active product by ID (storefront view).
 */
export const getProductDetails = async (id) => {
  const response = await apiFetch(`/api/storefront/detail/${id}`);
  return response.product;
};

/**
 * ----------------------------------------
 * ADMIN API
 * ----------------------------------------
 */

/**
 * Fetch all products (admin inventory view).
 */
export async function getAllProducts() {
  return await apiFetch('/api/admin/inventory');
}

/**
 * Fetch a single product by ID (admin view).
 */
export async function getProductById(id) {
  return await apiFetch(`/api/admin/inventory/${id}`);
}

/**
 * Create a new product. Uses FormData for image upload.
 */
export async function createProduct(formData) {
  return await apiFetch('/api/admin/inventory', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Update an existing product. Uses FormData for image upload.
 */
export async function updateProduct(id, formData) {
  return await apiFetch(`/api/admin/inventory/${id}`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Soft delete a product.
 */
export async function deactivateProduct(id) {
  return await apiFetch(`/api/admin/inventory/${id}/deactivate`, {
    method: 'POST',
  });
}

/**
 * Fetch all soft-deleted products.
 */
export async function getInactiveProducts() {
  return await apiFetch('/api/admin/inventory/trash');
}

/**
 * Restore a soft-deleted product.
 */
export async function restoreProduct(id) {
  return await apiFetch(`/api/admin/inventory/${id}/restore`, {
    method: 'POST',
  });
}

/**
 * Permanently delete a product.
 */
export async function hardDeleteProduct(id) {
  return await apiFetch(`/api/admin/inventory/${id}`, {
    method: 'DELETE',
  });
}
