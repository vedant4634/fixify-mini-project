/**
 * Customer Routes
 * Base: /api/customers
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, customerController.getCustomers);
router.get('/:id', optionalAuth, customerController.getCustomerById);
router.put('/:id', optionalAuth, customerController.updateCustomer);
router.get('/:id/bookings', optionalAuth, customerController.getCustomerBookings);

module.exports = router;
