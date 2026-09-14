import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import CommentSection from '../components/CommentSection';
import '../styles/BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const { API_BASE_URL } = useConfig();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postService.getPostById(id);
      setPost(response.data.post);
    } catch (error) {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await postService.toggleLike(id);
      setPost(prev => ({
        ...prev,
        isLikedByUser: response.data.data.isLiked,
        likesCount: response.data.data.likesCount
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleCommentAdded = (newComment) => {
    setPost(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments],
      commentsCount: prev.commentsCount + 1
    }));
  };

  const handleCommentDeleted = (commentId) => {
    setPost(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c._id !== commentId),
      commentsCount: prev.commentsCount - 1
    }));
  };

  if (loading) return <Loader />;

  if (!post) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Post not found</h2>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="container">
        <article className="blog-detail">
          <div className="blog-detail-header">
            <span className={`badge badge-${post.category}`}>
              {post.category}
            </span>
            <h1 className="blog-detail-title">{post.title}</h1>

            <div className="blog-detail-meta">
              <div className="blog-detail-author">
                <div className="author-avatar">
                  {post.author?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="author-info">
                  <span className="author-name">{post.author?.name}</span>
                  <span className="blog-date">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="blog-detail-actions">
                <button
                  className={`like-btn ${post.isLikedByUser ? 'liked' : ''}`}
                  onClick={handleLike}
                  title={post.isLikedByUser ? 'Unlike' : 'Like'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLikedByUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{post.likesCount || 0}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="blog-detail-cover">
            <img
              src={`${API_BASE_URL}/uploads/${post.coverImage}`}
              alt={post.title}
            />
          </div>

          <div
            className="blog-detail-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <CommentSection
            postId={post._id}
            comments={post.comments}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;