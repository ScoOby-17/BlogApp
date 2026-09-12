import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const { API_BASE_URL } = useConfig();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const response = await userService.getUserPosts();
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);
      toast.success('Post deleted successfully');
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={`${API_BASE_URL}/uploads/${user.avatar}`} alt={user.name} />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="profile-badge">Admin</span>
              )}
            </div>
          </div>
          <Link to="/create" className="btn btn-primary">
            Create New Post
          </Link>
        </div>

        <div className="profile-posts">
          <h2 className="profile-posts-title">
            My Posts ({posts.length})
          </h2>

          {posts.length > 0 ? (
            <div className="profile-posts-grid">
              {posts.map(post => (
                <div key={post._id} className="profile-post-card">
                  <div className="profile-post-image">
                    <img
                      src={`${API_BASE_URL}/uploads/${post.coverImage}`}
                      alt={post.title}
                    />
                    <span className={`badge badge-${post.category}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="profile-post-content">
                    <h3 className="profile-post-title">{post.title}</h3>
                    <div className="profile-post-stats">
                      <span>❤️ {post.likesCount || 0}</span>
                      <span>💬 {post.commentsCount || 0}</span>
                    </div>
                    <div className="profile-post-actions">
                      <Link
                        to={`/posts/${post._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit/${post._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-posts-empty">
              <p>You haven't created any posts yet.</p>
              <Link to="/create" className="btn btn-primary">
                Create Your First Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
