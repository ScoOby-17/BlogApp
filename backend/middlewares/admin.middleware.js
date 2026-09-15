// =============================================================================
// admin.middleware.js — Checks if the logged-in user is an admin
// =============================================================================
// This middleware must be used AFTER the auth middleware (which sets req.user).
// It checks if the user's role is "admin". If not, it sends a 403 error.
// =============================================================================

const admin = (req, res, next) => {
  // 1. Make sure the user is logged in (auth middleware should have set req.user)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // 2. Check if the user has the "admin" role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // 3. User is an admin — let them continue
  next();
};

export default admin;
