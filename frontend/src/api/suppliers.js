import { apiFetch } from './client';

export async function getSuppliers() {
  return apiFetch('/api/suppliers');
}

export async function createSupplier(data) {
  return apiFetch('/api/suppliers', {
    method: 'POST',
    body: data,
  });
}

export async function updateSupplier(id, data) {
  return apiFetch(`/api/suppliers/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function getDeliveries(supplierId) {
  return apiFetch(`/api/suppliers/${supplierId}/deliveries`);
}

export async function recordDelivery(data) {
  return apiFetch('/api/deliveries', {
    method: 'POST',
    body: data,
  });
}
