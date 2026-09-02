/**
 * Authentication controller
 * Handles signup, login, logout, and current user
 */

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'nova-dev-secret';
const JWT_EXPIRES = '7d';

/**
 * Generate JWT for user
 */
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

/**
 * POST /api/auth/register
 * Create new user account
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/login
 * Login user, return JWT
 */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    const u = user.toJSON();
    delete u.password;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: { id: u._id, name: u.name, email: u.email, role: u.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * GET /api/auth/me
 * Return current user (requires auth)
 */
exports.me = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/auth/logout
 * Client should discard token; optional server-side blacklist in production
 */
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out.' });
};
