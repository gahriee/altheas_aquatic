import { apiFetch } from './client';

export async function getCategories() {
  return apiFetch('/api/categories');
}

export async function createCategory(data) {
  return apiFetch('/api/categories', {
    method: 'POST',
    body: data,
  });
}

export async function deleteCategory(id) {
  return apiFetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}
