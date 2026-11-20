/**
 * Saved Providers (Favorites) Routes
 * Base: /api/saved
 */

const express = require('express');
const router = express.Router();
const savedController = require('../controllers/savedController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, savedController.getSavedProviders);
router.post('/:providerId', optionalAuth, savedController.saveProvider);
router.delete('/:providerId', optionalAuth, savedController.unsaveProvider);

module.exports = router;

