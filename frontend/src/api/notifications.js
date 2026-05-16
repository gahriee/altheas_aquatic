import { apiFetch } from './client';

/**
 * Fetches the latest notifications for the admin feed.
 * @param {number} limit 
 */
export async function getNotifications(limit = 50) {
  return await apiFetch(`/api/admin/notifications?limit=${limit}`);
}

/**
 * Returns the count of unread notifications.
 */
export async function getUnreadCount() {
  return await apiFetch('/api/admin/notifications/unread-count');
}

/**
 * Marks a single notification as read.
 * @param {number|string} id 
 */
export async function markAsRead(id) {
  return await apiFetch(`/api/admin/notifications/${id}/read`, {
    method: 'POST'
  });
}

/**
 * Marks all notifications as read.
 */
export async function markAllAsRead() {
  return await apiFetch('/api/admin/notifications/read-all', {
    method: 'POST'
  });
}

/**
 * Fetches paginated history of notifications with optional filters.
 * @param {number} page 
 * @param {number} perPage 
 * @param {string} type 
 * @param {number} isRead 
 */
export async function getHistory(page = 1, perPage = 20, type = '', isRead = '') {
  const params = new URLSearchParams({
    page: page,
    per_page: perPage,
  });
  if (type) params.append('type', type);
  if (isRead !== '') params.append('is_read', isRead);

  return await apiFetch(`/api/admin/notifications/history?${params.toString()}`);
}

/**
 * Deletes all read notifications.
 */
export async function deleteReadNotifications() {
  return await apiFetch('/api/admin/notifications/delete-read', {
    method: 'POST'
  });
}

const notificationsApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getHistory,
  deleteReadNotifications
};

export default notificationsApi;
