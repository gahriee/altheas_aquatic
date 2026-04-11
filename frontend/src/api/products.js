import { apiFetch } from './client';

export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/products?${query}`);
}

export async function getProduct(id) {
  return apiFetch(`/api/products/${id}`);
}

export async function createProduct(formData) {
  return apiFetch('/api/products', {
    method: 'POST',
    body: formData, // FormData
  });
}

export async function updateProduct(id, formData) {
  return apiFetch(`/api/products/${id}`, {
    method: 'POST', // Use POST for multipart/form-data with potential file upload
    body: formData,
  });
}

export async function deactivateProduct(id) {
  return apiFetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
}
