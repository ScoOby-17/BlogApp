import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import '../styles/Profile.css';

const Profile = () => {
  const { user, checkAuth, logout } = useAuth();
  const { API_BASE_URL } = useConfig();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchUserPosts();
    if (user) {
      setName(user.name);
    }
  }, [user]);

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

  const handleEditClick = () => {
    setName(user.name);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await userService.updateProfile(formData);
      await checkAuth(); // Refresh user details in AuthContext
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your profile? This will permanently delete your account, posts, and comments. This action cannot be undone.')) {
      return;
    }

    try {
      await userService.deleteProfile();
      toast.success('Profile deleted successfully');
      await logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete profile');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return; // Added return here
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
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="profile-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, marginRight: '2rem' }}>
              <div className="profile-edit-avatar" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="profile-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #eee' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : user?.avatar ? (
                    <img src={`${API_BASE_URL}/uploads/${user.avatar}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="profile-avatar-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ddd', fontSize: '24px' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <input type="file" accept="image/jpeg, image/png, image/jpg, image/webp" onChange={handleAvatarChange} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '0.5rem', width: '100%', maxWidth: '300px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
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
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={handleEditClick} className="btn-secondary btn-sm" style={{ padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc', background: 'transparent' }}>
                    Edit Profile
                  </button>
                  <button onClick={handleDeleteProfile} className="btn-danger btn-sm" style={{ padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', border: 'none', background: '#dc3545', color: '#fff' }}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
          <Link to="/create" className="btn btn-primary" style={{ height: 'fit-content' }}>
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
                      <span>️ {post.likesCount || 0}</span>
                      <span> {post.commentsCount || 0}</span>
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