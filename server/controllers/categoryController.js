/**
 * Categories & Testimonials Controller
 * Provides trade categories and customer testimonials using plain SQL queries.
 */

const pool = require('../config/db');

const DEFAULT_CATEGORY_IMAGES = {
  'ac-repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'appliance-repair': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
  'carpenter': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
  'cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'mechanic': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  'painter': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'plumber': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
};

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
      image: c.image || DEFAULT_CATEGORY_IMAGES[c.id] || DEFAULT_CATEGORY_IMAGES['plumber'],
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
