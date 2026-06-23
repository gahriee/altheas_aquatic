import { apiFetch } from './client';

/**
 * ----------------------------------------
 * getDeliveries
 * ----------------------------------------
 * Fetch all deliveries for a specific supplier.
 */
export async function getDeliveries(supplierId) {
  return await apiFetch(`/api/admin/suppliers/${supplierId}/deliveries`);
}

/**
 * ----------------------------------------
 * recordDelivery
 * ----------------------------------------
 * Record a new delivery and update stock.
 */
export async function recordDelivery(data) {
  return await apiFetch('/api/admin/suppliers/delivery', {
    method: 'POST',
    body: data,
  });
}

export async function deleteDeliveryRecord(deliveryId) {
  return apiFetch(`/api/admin/suppliers/delivery/${deliveryId}/delete`, { method: 'POST' });
}
