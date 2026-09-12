import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getUserPosts: async () => {
    const response = await api.get('/users/me/posts');
    return response.data;
  }
};
