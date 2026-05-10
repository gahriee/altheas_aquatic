import { apiFetch as client } from './client';

export const fetchUsers = async (type = 'all') => {
  return await client(`/api/admin/users?type=${type}`);
};

export const createUser = async (data) => {
  return await client('/api/admin/users', {
    method: 'POST',
    body: data,
  });
};

export const updateUser = async (id, data) => {
  return await client(`/api/admin/users/${id}`, {
    method: 'POST',
    body: data,
  });
};

export const deleteUser = async (id) => {
  return await client(`/api/admin/users/${id}/delete`, {
    method: 'POST',
  });
};
