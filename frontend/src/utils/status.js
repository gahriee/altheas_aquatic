/**
 * Returns Tailwind CSS class string for an order status badge.
 * Handles: confirmed, paid, pending, cancelled, failed, completed.
 */
export function getOrderStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'paid':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    case 'pending':
      return 'bg-amber-100 text-amber-600 border-amber-200';
    case 'cancelled':
    case 'failed':
      return 'bg-coral-100 text-coral-600 border-coral-200';
    case 'completed':
      return 'bg-teal-100 text-teal-600 border-teal-200';
    default:
      return 'bg-sage-100 text-sage-400 border-sage-200';
  }
}
