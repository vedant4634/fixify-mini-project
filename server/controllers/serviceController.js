/**
 * Service Offerings & Catalog Controller
 * Provides service categories, packages, and custom service operations using plain SQL.
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
 * Format category / service row into frontend compatible shape
 */
function formatServiceCategory(c) {
  const popServices = safeParseJson(c.popular_services, []);
  const categoryImage = c.image || DEFAULT_CATEGORY_IMAGES[c.id] || DEFAULT_CATEGORY_IMAGES['plumber'];

  return {
    id: c.id,
    slug: c.id,
    name: c.name,
    shortName: c.short_name || c.name,
    category: c.short_name || c.name,
    icon: c.icon || 'Wrench',
    image: categoryImage,
    shortDesc: c.description || 'Professional home repair and installation service',
    description: c.description || 'Professional home repair and installation service',
    startingPrice: Number(c.starting_price) || 299,
    price: Number(c.starting_price) || 299,
    priceUnit: 'onwards',
    popularServices: popServices,
    included: popServices.length > 0 ? popServices : [
      'Comprehensive inspection and fault diagnosis',
      'Standard replacement / repair with warranty',
      'Clean post-work area'
    ],
    badge: c.badge || 'Popular',
    accentColor: c.accent_color,
    borderColor: c.border_color,
    rating: 4.8,
    reviewsCount: 120,
  };
}

/**
 * GET /api/services
 * Retrieve all service catalog items / categories
 */
async function getAllServices(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY starting_price ASC');
    const services = rows.map(formatServiceCategory);

    return res.status(200).json(services);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/services/:id
 * Retrieve a specific service category or package
 */
async function getServiceById(req, res, next) {
  try {
    const { id } = req.params;

    // Check categories first (by id or slug)
    const [catRows] = await pool.query('SELECT * FROM categories WHERE id = ? OR short_name = ? LIMIT 1', [id, id]);
    if (catRows.length > 0) {
      return res.status(200).json(formatServiceCategory(catRows[0]));
    }

    // Check services table
    const [svcRows] = await pool.query('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
    if (svcRows.length > 0) {
      const s = svcRows[0];
      return res.status(200).json({
        id: s.id,
        providerId: s.provider_id,
        name: s.name,
        price: Number(s.price),
        duration: s.duration,
        description: s.description,
        rating: 4.8,
        image: DEFAULT_CATEGORY_IMAGES['plumber'],
      });
    }

    return res.status(404).json({
      success: false,
      message: `Service "${id}" not found.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/services
 * Create a new service package or category
 */
async function createService(req, res, next) {
  try {
    const { name, shortName, icon, image, description, startingPrice, price, badge, popularServices } = req.body;

    const id = req.body.id || req.body.slug || `svc-${Date.now()}`;
    const cleanPrice = Number(startingPrice || price || 299);
    const categoryImage = image || DEFAULT_CATEGORY_IMAGES[id] || null;

    await pool.query(
      `INSERT INTO categories (id, name, short_name, icon, image, description, starting_price, popular_services, badge)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name || 'New Service',
        shortName || name || 'Service',
        icon || 'Wrench',
        categoryImage,
        description || 'Custom service package',
        cleanPrice,
        JSON.stringify(popularServices || []),
        badge || 'New',
      ]
    );

    const [created] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
    return res.status(201).json(formatServiceCategory(created[0]));
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/services/:id
 * Update an existing service package
 */
async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { name, shortName, description, startingPrice, price, icon, image } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (shortName) { updates.push('short_name = ?'); params.push(shortName); }
    if (description) { updates.push('description = ?'); params.push(description); }
    if (startingPrice || price) { updates.push('starting_price = ?'); params.push(Number(startingPrice || price)); }
    if (icon) { updates.push('icon = ?'); params.push(icon); }
    if (image) { updates.push('image = ?'); params.push(image); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.status(200).json(formatServiceCategory(updated[0]));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/services/:id
 * Remove a service from catalog
 */
async function deleteService(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    await pool.query('DELETE FROM services WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Service removed successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
