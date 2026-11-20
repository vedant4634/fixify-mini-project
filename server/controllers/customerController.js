/**
 * Customer Controller
 * Handles customer listings, profiles, and associated booking histories using plain SQL.
 * Never exposes passwords or sensitive credentials.
 */

const pool = require('../config/db');

/**
 * Format database user row as a customer object matching the frontend shape
 */
function formatCustomer(row, bookingsCount = 0, totalSpent = 0) {
  if (!row) return null;
  const rawId = row.id;
  return {
    id: `cust-${rawId}`,
    rawId: rawId,
    name: row.name,
    email: row.email,
    phone: row.phone || '+91 98000 00000',
    avatar: row.avatar,
    city: row.address ? (row.address.split(',')[1] || row.address.split(',')[0] || 'Pune').trim() : 'Pune',
    address: row.address || 'Pune, Maharashtra',
    bookingsCount: Number(bookingsCount),
    totalSpent: Number(totalSpent),
    status: 'Active',
    joinedDate: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024',
    createdAt: row.created_at,
  };
}

/**
 * GET /api/customers
 * Retrieve all registered customers with their booking statistics
 */
async function getCustomers(req, res, next) {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.address, u.role, u.created_at,
        COUNT(b.id) AS bookings_count,
        COALESCE(SUM(b.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      WHERE u.role = 'customer' OR u.role IS NULL
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const [rows] = await pool.query(query);
    const customers = rows.map((r) => formatCustomer(r, r.bookings_count, r.total_spent));

    return res.status(200).json(customers);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/customers/:id
 * Retrieve a single customer by ID
 */
async function getCustomerById(req, res, next) {
  try {
    let { id } = req.params;
    // Handle 'cust-1' format or numeric 1
    const numericId = parseInt(id.replace(/\D/g, ''), 10) || id;

    const query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.address, u.role, u.created_at,
        COUNT(b.id) AS bookings_count,
        COALESCE(SUM(b.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [numericId]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer ${id} not found.`,
      });
    }

    return res.status(200).json(formatCustomer(rows[0], rows[0].bookings_count, rows[0].total_spent));
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/customers/:id
 * Update customer profile information
 */
async function updateCustomer(req, res, next) {
  try {
    let { id } = req.params;
    const numericId = parseInt(id.replace(/\D/g, ''), 10) || id;
    const { name, phone, address, avatar } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone.trim());
    }
    if (address) {
      updates.push('address = ?');
      params.push(address.trim());
    }
    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar.trim());
    }

    if (updates.length > 0) {
      params.push(numericId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.address, u.role, u.created_at,
              COUNT(b.id) AS bookings_count, COALESCE(SUM(b.total_amount), 0) AS total_spent
       FROM users u LEFT JOIN bookings b ON b.user_id = u.id WHERE u.id = ? GROUP BY u.id`,
      [numericId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json(formatCustomer(rows[0], rows[0].bookings_count, rows[0].total_spent));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/customers/:id/bookings
 * Retrieve all bookings associated with a specific customer
 */
async function getCustomerBookings(req, res, next) {
  try {
    let { id } = req.params;
    const numericId = parseInt(id.replace(/\D/g, ''), 10) || id;

    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      [numericId]
    );

    // If no bookings by user_id, also check if any booking has matching customer name or phone
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
  getCustomerBookings,
};
