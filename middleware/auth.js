/**
 * Authentication middleware
 * Verifies JWT and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - require valid JWT
 * Use for: cart, checkout, profile, etc.
 */
const protect = async (req, res, next) => {
  let token = null;

  // Check Authorization header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nova-dev-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized. Invalid or expired token.' });
  }
};

/**
 * Optional auth - attach user if token present, but don't require it
 * Use for: shop, home (show personalized bits when logged in)
 */
const optionalAuth = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nova-dev-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (_) {}
  next();
};

module.exports = { protect, optionalAuth };
