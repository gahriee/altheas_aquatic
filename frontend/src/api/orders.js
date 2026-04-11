import { apiFetch } from './client';

export async function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/orders?${query}`);
}

export async function getOrder(id) {
  return apiFetch(`/api/orders/${id}`);
}

export async function updateOrderStatus(id, status) {
  return apiFetch(`/api/orders/${id}/status`, {
    method: 'POST',
    body: { status },
  });
}

export async function submitCheckout(data) {
  return apiFetch('/api/checkout', {
    method: 'POST',
    body: data,
  });
}

export async function getConfirmation(id) {
  return apiFetch(`/api/orders/${id}/confirmation`);
}
