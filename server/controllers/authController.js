/**
 * Authentication Controller
 * Handles user registration, login, profile retrieval, and password management using plain SQL queries.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fixify_super_secret_jwt_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/signup
 * Register a new customer
 */
async function signup(req, res, next) {
  try {
    const { name, email, password, phone, address, city, pincode } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default avatar
    const defaultAvatar = `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80`;
    const fullAddress = address ? (city ? `${address}, ${city}${pincode ? ' - ' + pincode : ''}` : address) : 'Mumbai, Maharashtra';

    // 4. Insert user into database
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, phone, avatar, address, role)
       VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
      [
        name.trim(),
        cleanEmail,
        hashedPassword,
        phone || null,
        defaultAvatar,
        fullAddress,
      ]
    );

    const newUserId = result.insertId;

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || null,
      avatar: defaultAvatar,
      address: fullAddress,
      role: 'customer',
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Fixify.',
      token,
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate existing user and return JWT
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch user from database
    const [users] = await pool.query(
      'SELECT id, name, email, password, phone, avatar, address, role FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.',
      });
    }

    const user = users[0];

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // 3. Generate token & response
    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Retrieve profile of currently authenticated user
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, avatar, address, role, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 * Update profile details (name, phone, address, avatar)
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, address, avatar } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No profile fields to update.',
      });
    }

    params.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, avatar, address, role, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/password
 * Change password securely
 */
async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
};
