import api from './api';

export const postService = {
  getPosts: async (page = 1, limit = 9, category = 'all') => {
    const response = await api.get('/posts', {
      params: { page, limit, category: category === 'all' ? undefined : category }
    });
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (formData) => {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updatePost: async (id, formData) => {
    const response = await api.put(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  }
};
