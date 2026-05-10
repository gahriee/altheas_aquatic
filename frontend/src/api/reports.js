import { apiFetch } from './client';

export async function getSalesReport(from, to) {
  return apiFetch(`/api/admin/reports/sales?from=${from}&to=${to}`);
}

export async function getInventoryReport() {
  return apiFetch('/api/admin/reports/inventory');
}

export async function getSuppliersReport(from, to) {
  return apiFetch(`/api/admin/reports/suppliers?from=${from}&to=${to}`);
}

export function exportCsv(type, from, to) {
  window.location.href = `/api/admin/reports/export?type=${type}&from=${from}&to=${to}`;
}
