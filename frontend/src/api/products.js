import { apiFetch } from './client';

/**
 * ----------------------------------------
 * getAllProducts
 * ----------------------------------------
 * Fetch all products (admin view).
 */
export async function getAllProducts() {
  return await apiFetch('/api/admin/inventory');
}

/**
 * ----------------------------------------
 * getProductById
 * ----------------------------------------
 * Fetch a single product by ID.
 */
export async function getProductById(id) {
  return await apiFetch(`/api/admin/inventory/${id}`);
}

/**
 * ----------------------------------------
 * createProduct
 * ----------------------------------------
 * Create a new product. Uses FormData for image upload.
 */
export async function createProduct(formData) {
  return await apiFetch('/api/admin/inventory', {
    method: 'POST',
    body: formData,
  });
}

/**
 * ----------------------------------------
 * updateProduct
 * ----------------------------------------
 * Update an existing product. Uses FormData for image upload.
 */
export async function updateProduct(id, formData) {
  return await apiFetch(`/api/admin/inventory/${id}`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * ----------------------------------------
 * deactivateProduct
 * ----------------------------------------
 * Soft delete a product.
 */
export async function deactivateProduct(id) {
  return await apiFetch(`/api/admin/inventory/${id}/deactivate`, {
    method: 'POST',
  });
}

/**
 * ----------------------------------------
 * getInactiveProducts
 * ----------------------------------------
 * Fetch all soft-deleted products.
 */
export async function getInactiveProducts() {
  return await apiFetch('/api/admin/inventory/trash');
}

/**
 * ----------------------------------------
 * restoreProduct
 * ----------------------------------------
 * Restore a soft-deleted product.
 */
export async function restoreProduct(id) {
  return await apiFetch(`/api/admin/inventory/${id}/restore`, {
    method: 'POST',
  });
}

/**
 * ----------------------------------------
 * hardDeleteProduct
 * ----------------------------------------
 * Permanently delete a product.
 */
export async function hardDeleteProduct(id) {
  return await apiFetch(`/api/admin/inventory/${id}`, {
    method: 'DELETE',
  });
}
