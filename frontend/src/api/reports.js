import { apiFetch } from './client';

export async function getSalesReport(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/reports/sales?${query}`);
}

export async function getInventoryReport() {
  return apiFetch('/api/reports/inventory');
}

export async function getSuppliersReport(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/reports/suppliers?${query}`);
}

export async function exportCsv(params = {}) {
  const query = new URLSearchParams(params).toString();
  // CSV export is a direct link usually, but we can wrap it if needed for CSRF
  window.location.href = `/api/reports/export?${query}`;
}
