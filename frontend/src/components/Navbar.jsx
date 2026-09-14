import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon"></span>
          <span className="logo-text">BlogApp</span>
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMenu}>
            Home
          </Link>

          {user ? (
            <>
              <Link to="/create" className="navbar-link" onClick={closeMenu}>
                Create Post
              </Link>
              <Link to="/profile" className="navbar-link" onClick={closeMenu}>
                Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="navbar-link navbar-link-admin" onClick={closeMenu}>
                  Dashboard
                </Link>
              )}
              <button className="navbar-link navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="navbar-link btn-primary navbar-cta" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;