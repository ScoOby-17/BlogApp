import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../services/adminService';
import { postService } from '../services/postService';
import Loader from '../components/Loader';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllPosts();
      if (response.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their posts and comments.`)) {
      return;
    }

    try {
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user._id !== userId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to delete post "${postTitle}"?`)) {
      return;
    }

    try {
      const response = await postService.deletePost(postId);
      if (response.success) {
        toast.success('Post deleted successfully');
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users and posts</p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({posts.length})
          </button>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <Loader />
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="users-section">
                  {users.length === 0 ? (
                    <div className="empty-state">No users found</div>
                  ) : (
                    <div className="data-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user._id}>
                              <td>
                                <div className="user-cell">
                                  <div className="user-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{user.name}</span>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>{formatDate(user.createdAt)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="posts-section">
                  {posts.length === 0 ? (
                    <div className="empty-state">No posts found</div>
                  ) : (
                    <div className="data-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.map(post => (
                            <tr key={post._id}>
                              <td>
                                <div className="post-title-cell">
                                  {post.title}
                                </div>
                              </td>
                              <td>{post.author?.name}</td>
                              <td>
                                <span className={`badge badge-${post.category}`}>
                                  {post.category}
                                </span>
                              </td>
                              <td>{formatDate(post.createdAt)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeletePost(post._id, post.title)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
