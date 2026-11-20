/**
 * Provider & Technician Routes
 * Base: /api/providers and /api/technicians
 */

const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');

// List providers / technicians with search, geospatial distance, and filters
router.get('/', providerController.getProviders);

// Technician self-registration
router.post('/register', optionalAuth, providerController.registerTechnician);

// Retrieve provider by ID with services, reviews, and distance
router.get('/:id', providerController.getProviderById);

// Update technician profile details
router.put('/:id', optionalAuth, providerController.updateProvider);

// Admin status update (Verified / Pending / Suspended)
router.patch('/:id/status', optionalAuth, providerController.updateStatus);

// Retrieve bookings for a specific technician
router.get('/:id/bookings', optionalAuth, providerController.getProviderBookings);

// Submit a review for technician
router.post('/:id/reviews', optionalAuth, providerController.addReview);

module.exports = router;
