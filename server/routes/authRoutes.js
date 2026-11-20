/**
 * Authentication Routes
 * Base: /api/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.put('/me', authenticateToken, authController.updateProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.changePassword);

module.exports = router;
