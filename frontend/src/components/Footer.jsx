import '../styles/Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">BlogApp</span>
            </div>
            <p className="footer-tagline">
              Sharing knowledge, one story at a time
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Home</a></li>
              <li><a href="#" className="footer-link">All Posts</a></li>
              <li><a href="#" className="footer-link">Categories</a></li>
              <li><a href="#" className="footer-link">About</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
            </ul>
          </div>

          {/* Categories Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">Categories</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Tech</a></li>
              <li><a href="#" className="footer-link">Food</a></li>
              <li><a href="#" className="footer-link">Other</a></li>
              <li><a href="#" className="footer-link">Place</a></li>
            </ul>
          </div>

          {/* Contact/Social Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">Contact</h3>
            <ul className="footer-contact">
              <li><span>📧</span> hello@blogverse.com</li>
              <li><span>📍</span> Remote / Worldwide</li>
              <li>
                <div className="footer-social">
                  <a href="#" className="social-link">Twitter</a>
                  <a href="#" className="social-link">Instagram</a>
                  <a href="#" className="social-link">GitHub</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} BlogApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
