/**
 * JWT Authentication Middleware
 * Validates the "Authorization: Bearer <token>" header on protected endpoints.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fixify_super_secret_jwt_key_2026_change_in_production';

/**
 * Required authentication middleware
 * Blocks requests that lack a valid JWT.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Support both "Bearer <token>" and bare token
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
}

/**
 * Optional authentication middleware
 * If a valid token is provided, attaches req.user; otherwise proceeds as guest.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore token failure for optional authentication
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
};

