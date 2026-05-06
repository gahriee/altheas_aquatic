import { apiFetch } from './client';

export async function getCart() {
  return apiFetch('/api/cart');
}

export async function addToCart(data) {
  return apiFetch('/api/cart/add', {
    method: 'POST',
    body: data,
  });
}

export async function updateCart(data) {
  return apiFetch('/api/cart/update', {
    method: 'POST',
    body: data,
  });
}

export async function removeFromCart(productId) {
  return apiFetch('/api/cart/remove', {
    method: 'POST',
    body: { product_id: productId },
  });
}

export async function clearCart() {
  return apiFetch('/api/cart/clear', {
    method: 'POST',
  });
}
