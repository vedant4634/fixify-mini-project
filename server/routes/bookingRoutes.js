/**
 * Booking Routes
 * Base: /api/bookings
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, bookingController.createBooking);
router.get('/', optionalAuth, bookingController.getMyBookings);
router.get('/:id', optionalAuth, bookingController.getBookingById);
router.patch('/:id', optionalAuth, bookingController.updateBooking);
router.patch('/:id/status', optionalAuth, bookingController.updateBookingStatus);
router.post('/:id/cancel', optionalAuth, bookingController.cancelBooking);
router.post('/:id/review', optionalAuth, bookingController.addBookingReview);

module.exports = router;
