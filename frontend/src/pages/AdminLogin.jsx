import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.adminId.trim()) {
      toast.error('Admin ID is required');
      return;
    }

    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await adminService.login(formData);

      if (response.success) {
        login(response.data.user);
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-icon"></div>
            <h1>Admin Login</h1>
            <p>Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label className="form-label">Admin ID</label>
              <input
                type="text"
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your admin ID"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;