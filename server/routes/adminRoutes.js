/**
 * Admin Routes
 * Base: /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');

router.get('/stats', optionalAuth, adminController.getAdminStats);

module.exports = router;
