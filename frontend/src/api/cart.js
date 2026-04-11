import { apiFetch } from './client';

export async function getCart() {
  return apiFetch('/api/cart');
}

export async function addToCart(data) {
  return apiFetch('/api/cart', {
    method: 'POST',
    body: data,
  });
}

export async function updateCart(data) {
  return apiFetch('/api/cart', {
    method: 'PUT',
    body: data,
  });
}

export async function removeFromCart(id) {
  return apiFetch(`/api/cart/${id}`, {
    method: 'DELETE',
  });
}

export async function clearCart() {
  return apiFetch('/api/cart', {
    method: 'DELETE',
  });
}
