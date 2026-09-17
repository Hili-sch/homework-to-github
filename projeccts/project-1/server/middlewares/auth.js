/**
 * Authentication & Authorization Middlewares
 * 
 * Contains:
 * 1. Token validation checking for JWT inside the HTTP Authorization header.
 * 2. Role validation checks for Admin and Super Admin access.
 * 3. Resource ownership rules protecting regular user directories.
 */

const jwt = require('jsonwebtoken');

// A hardcoded secret key for JWT signing/verification
const JWT_SECRET = 'pulsefit-super-secret-key-2026-production';

/**
 * Middleware to authenticate JWT tokens from client request headers.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expecting format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required. Please login.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Access denied.' });
    }

    // Attach user metadata to request object for downstream middlewares/routes
    req.user = {
      userId: Number(decoded.userId),
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  });
}

/**
 * Middleware to restrict route strictly to Super Admins.
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Permission denied. Super Admin access required.' });
  }
  next();
}

/**
 * Middleware to restrict route to either Staff Admin or Super Admin roles.
 */
function requireAdminOrSuperAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Permission denied. Admin privileges required.' });
  }
  next();
}

/**
 * Middleware to check if the active user matches the target route parameter ID,
 * or if the active user is a Super Admin (ownership check).
 */
function verifyUserOwnership(req, res, next) {
  const targetUserId = Number(req.params.userId);
  
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  // Super Admin can bypass user ownership checks to manage anyone's data
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Admin role cannot modify user workouts directly, only view them (or create new users)
  // Check if regular user matches own profile ID
  if (req.user.userId !== targetUserId) {
    return res.status(403).json({ error: 'Access denied. You can only view or modify your own records.' });
  }

  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireSuperAdmin,
  requireAdminOrSuperAdmin,
  verifyUserOwnership
};
