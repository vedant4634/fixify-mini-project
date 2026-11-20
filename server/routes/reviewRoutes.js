/**
 * Review Routes
 * Base: /api/reviews
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');

router.get('/', reviewController.getAllReviews);
router.post('/', optionalAuth, reviewController.createReview);
router.delete('/:id', optionalAuth, reviewController.deleteReview);
router.patch('/:id/flag', optionalAuth, reviewController.flagReview);

module.exports = router;
