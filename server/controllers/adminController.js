/**
 * Admin Controller
 * High-level system statistics, metrics, and administration data.
 */

const pool = require('../config/db');

/**
 * GET /api/admin/stats
 * Overview dashboard metrics
 */
async function getAdminStats(req, res, next) {
  try {
    const [[userCount]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    const [[providerCount]] = await pool.query('SELECT COUNT(*) AS total FROM providers');
    const [[bookingStats]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_bookings,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN total_amount ELSE 0 END), 0) AS total_revenue,
        SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) AS active_bookings,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_bookings,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings
      FROM bookings
    `);
    const [[ratingStats]] = await pool.query('SELECT ROUND(AVG(rating), 2) AS avg_rating FROM providers');

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers: userCount.total || 0,
        totalTechnicians: providerCount.total || 0,
        totalBookings: bookingStats.total_bookings || 0,
        totalRevenue: Number(bookingStats.total_revenue) || 0,
        activeBookings: bookingStats.active_bookings || 0,
        completedBookings: bookingStats.completed_bookings || 0,
        cancelledBookings: bookingStats.cancelled_bookings || 0,
        averageRating: Number(ratingStats.avg_rating) || 4.9,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminStats,
};
