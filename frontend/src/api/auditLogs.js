import { apiFetch } from './client';

/**
 * Fetch a paginated list of audit logs with optional filters.
 * @param {Object} params - Query parameters (page, per_page, action, resource_type, etc.)
 */
export async function fetchAuditLogs(params = {}) {
  // Convert params object to query string, removing empty values
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  
  const queryString = query.toString() ? `?${query.toString()}` : '';
  
  return apiFetch(`/api/admin/audit-logs${queryString}`);
}

/**
 * Fetch a single audit log entry by ID.
 * @param {number|string} id - The audit log ID
 */
export async function fetchAuditLogDetail(id) {
  return apiFetch(`/api/admin/audit-logs/${id}`);
}
