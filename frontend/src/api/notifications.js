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

const notificationsApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};

export default notificationsApi;
