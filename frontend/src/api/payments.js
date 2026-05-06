import { apiFetch } from './client';

/**
 * Creates a PayMongo PaymentIntent for a GCash checkout.
 * 
 * @param {Object} data - Customer and cart items.
 * @returns {Promise<Object>} - Contains order_id, redirect_url, payment_intent_id, and client_key.
 */
export async function createPaymentIntent(data) {
  return await apiFetch('/api/payments/create-intent', {
    method: 'POST',
    body: data,
    showToast: false // We handle loading/success states in the component
  });
}

/**
 * Checks the status of a PayMongo PaymentIntent.
 * 
 * @param {string} intentId - The PayMongo intent ID.
 * @returns {Promise<Object>} - Contains status and order_id.
 */
export async function checkPaymentStatus(intentId) {
  return await apiFetch(`/api/payments/status/${intentId}`, {
    method: 'GET',
    showToast: false
  });
}
