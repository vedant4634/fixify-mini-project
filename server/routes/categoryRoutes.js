/**
 * Category Routes
 * Base: /api/categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);

module.exports = router;

