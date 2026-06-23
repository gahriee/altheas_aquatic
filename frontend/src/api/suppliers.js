import { apiFetch } from './client';

export async function getSuppliers() {
  return apiFetch('/api/admin/suppliers');
}

export async function createSupplier(data) {
  return apiFetch('/api/admin/suppliers', {
    method: 'POST',
    body: data,
  });
}

export async function updateSupplier(id, data) {
  return apiFetch(`/api/admin/suppliers/${id}`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteSupplier(id) {
  return apiFetch(`/api/admin/suppliers/${id}/delete`, { method: 'POST' });
}
