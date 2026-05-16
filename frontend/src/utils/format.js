/**
 * Formats a number as Philippine Peso currency string (e.g. ₱1,500.00).
 */
export function formatCurrency(val) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(val || 0);
}

/**
 * Formats a date string into a human-readable long format
 * (e.g. "May 16, 2026").
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date string into a human-readable long format with time
 * (e.g. "May 16, 2026, 2:30 PM").
 */
export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
