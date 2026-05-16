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

/**
 * Formats a Unix timestamp (seconds) into a human-readable short date with time
 * (e.g. "May 16, 2026, 02:30 PM"). Returns "Never" if falsy.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Never';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date string into a compact short format
 * (e.g. "May 16, 2026").
 */
export function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
