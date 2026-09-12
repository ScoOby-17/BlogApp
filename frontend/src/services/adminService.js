import api from './api';

export const adminService = {
  login: async (data) => {
    const response = await api.post('/admin/login', data);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getAllPosts: async () => {
    const response = await api.get('/admin/posts');
    return response.data;
  }
};
