import api from './api';

export const commentService = {
  createComment: async (postId, text) => {
    const response = await api.post(`/posts/${postId}/comments`, { text });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};