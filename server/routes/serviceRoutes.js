/**
 * Service Offerings Routes
 * Base: /api/services
 */

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', optionalAuth, serviceController.createService);
router.put('/:id', optionalAuth, serviceController.updateService);
router.delete('/:id', optionalAuth, serviceController.deleteService);

module.exports = router;
