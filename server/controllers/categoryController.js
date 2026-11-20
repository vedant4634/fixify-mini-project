/**
 * Categories & Testimonials Controller
 * Provides trade categories and customer testimonials using plain SQL queries.
 */

const pool = require('../config/db');

function safeParseJson(value, fallback = []) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * GET /api/categories
 * Retrieve all service categories
 */
async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY starting_price ASC');

    const categories = rows.map((c) => ({
      id: c.id,
      name: c.name,
      shortName: c.short_name,
      icon: c.icon,
      description: c.description,
      startingPrice: Number(c.starting_price),
      popularServices: safeParseJson(c.popular_services, []),
      badge: c.badge,
      accentColor: c.accent_color,
      borderColor: c.border_color,
    }));

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
};

