/**
 * Bookings Controller
 * Manages service appointments, status transitions, rescheduling, reviews, and cancellations
 * using plain SQL queries.
 */

const pool = require('../config/db');

/**
 * Format a database booking row to camelCase matching the frontend BookingContext / API shape
 */
function formatBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    customerId: row.user_id ? String(row.user_id) : null,
    providerId: row.provider_id,
    technicianId: row.provider_id,
    providerName: row.provider_name,
    technicianName: row.provider_name,
    businessName: row.business_name,
    categoryName: row.category_name,
    providerPhoto: row.provider_photo,
    serviceName: row.service_name,
    date: row.date,
    timeSlot: row.time_slot,
    time: row.time_slot,
    status: row.status,
    cancelReason: row.cancel_reason,
    address: row.address,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    notes: row.notes,
    price: Number(row.price),
    taxes: Number(row.taxes),
    platformFee: Number(row.platform_fee),
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    isRated: Boolean(row.is_rated),
    rating: row.user_rating ? Number(row.user_rating) : null,
    userRating: row.user_rating ? Number(row.user_rating) : null,
    userReview: row.user_review,
    review: row.user_review,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * POST /api/bookings
 * Create a new service appointment
 */
async function createBooking(req, res, next) {
  try {
    const {
      providerId,
      technicianId,
      providerName,
      technicianName,
      businessName,
      categoryName,
      providerPhoto,
      serviceName,
      date,
      timeSlot,
      time,
      address,
      customerName,
      customerPhone,
      notes,
      price = 0,
      taxes = 0,
      platformFee = 49,
      totalAmount,
      paymentMethod = 'Pay After Service (Cash / UPI)',
    } = req.body;

    const targetProviderId = providerId || technicianId;
    const targetServiceName = serviceName || 'General Home Service';
    const targetDate = date || new Date().toISOString().split('T')[0];
    const targetTimeSlot = timeSlot || time || '10:00 AM - 12:00 PM';
    const targetAddress = address || 'Pune, Maharashtra';

    if (!targetProviderId) {
      return res.status(400).json({
        success: false,
        message: 'Provider / Technician ID is required.',
      });
    }

    // Generate readable booking reference ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `FIX-${randomSuffix}`;

    const userId = req.user ? req.user.id : null;
    const computedTotal = totalAmount !== undefined
      ? Number(totalAmount)
      : (Number(price) + Number(taxes) + Number(platformFee));

    const sql = `
      INSERT INTO bookings (
        id, user_id, provider_id, provider_name, business_name, category_name,
        provider_photo, service_name, date, time_slot, status, address,
        customer_name, customer_phone, notes, price, taxes, platform_fee,
        total_amount, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Upcoming', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      bookingId,
      userId,
      targetProviderId,
      providerName || technicianName || 'Certified Technician',
      businessName || null,
      categoryName || null,
      providerPhoto || null,
      targetServiceName,
      targetDate,
      targetTimeSlot,
      targetAddress,
      customerName || (req.user && req.user.name) || 'Valued Customer',
      customerPhone || (req.user && req.user.phone) || '+91 98000 00000',
      notes || null,
      Number(price),
      Number(taxes),
      Number(platformFee),
      Number(computedTotal),
      paymentMethod,
    ]);

    // Fetch newly created record
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [bookingId]);
    const created = formatBooking(rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: created,
      ...created,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings
 * Retrieve list of bookings. If authenticated, filters by user ID or returns user bookings.
 */
async function getMyBookings(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const { status, providerId, technicianId, customerId } = req.query;

    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (userId && !req.user.role?.includes('admin')) {
      sql += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(userId);
    } else if (customerId) {
      sql += ' AND user_id = ?';
      params.push(customerId);
    }

    if (providerId || technicianId) {
      sql += ' AND provider_id = ?';
      params.push(providerId || technicianId);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    const bookings = rows.map(formatBooking);

    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/:id
 * Retrieve a single booking by ID
 */
async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${id} was not found.`,
      });
    }

    const booking = formatBooking(rows[0]);
    return res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/bookings/:id
 * General booking update: Reschedule, modify notes, address, etc.
 */
async function updateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { status, cancelReason, date, timeSlot, isRated, userRating, userReview, notes, address } = req.body;

    const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking "${id}" was not found.`,
      });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (cancelReason !== undefined) {
      updates.push('cancel_reason = ?');
      params.push(cancelReason);
    }
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }
    if (timeSlot) {
      updates.push('time_slot = ?');
      params.push(timeSlot);
    }
    if (address) {
      updates.push('address = ?');
      params.push(address);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (isRated !== undefined) {
      updates.push('is_rated = ?');
      params.push(isRated ? 1 : 0);
    }
    if (userRating !== undefined) {
      updates.push('user_rating = ?');
      params.push(Number(userRating));
    }
    if (userReview !== undefined) {
      updates.push('user_review = ?');
      params.push(userReview);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update parameters provided.',
      });
    }

    params.push(id);
    const sql = `UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
    const formatted = formatBooking(updated[0]);

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/bookings/:id/status
 * Dedicated status updater (e.g. In Progress, Completed, Cancelled)
 */
async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }

    // Map common frontend statuses to DB enum ('Upcoming', 'Completed', 'Cancelled')
    let dbStatus = status;
    if (status === 'Confirmed' || status === 'In Progress' || status === 'Pending') {
      dbStatus = 'Upcoming';
    } else if (status === 'Completed' || status === 'Done') {
      dbStatus = 'Completed';
    } else if (status === 'Cancelled' || status === 'Rejected') {
      dbStatus = 'Cancelled';
    }

    const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking "${id}" was not found.`,
      });
    }

    let sql = 'UPDATE bookings SET status = ?';
    const params = [dbStatus];

    if (note) {
      sql += ', notes = CONCAT(COALESCE(notes, ""), "\nStatus Note: ", ?)';
      params.push(note);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await pool.query(sql, params);

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
    const formatted = formatBooking(updated[0]);
    // Preserve custom frontend status string in response if provided
    formatted.status = status;

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking with optional reason
 */
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking "${id}" was not found.`,
      });
    }

    await pool.query(
      'UPDATE bookings SET status = "Cancelled", cancel_reason = ? WHERE id = ?',
      [reason, id]
    );

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
    return res.status(200).json(formatBooking(updated[0]));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/:id/review
 * Rate a completed service booking
 */
async function addBookingReview(req, res, next) {
  try {
    const { id: bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required.',
      });
    }

    const [bookingRows] = await pool.query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [bookingId]);
    if (bookingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking "${bookingId}" was not found.`,
      });
    }

    const booking = bookingRows[0];
    const numRating = parseFloat(rating);

    // Update booking record
    await pool.query(
      'UPDATE bookings SET is_rated = 1, user_rating = ?, user_review = ? WHERE id = ?',
      [numRating, comment.trim(), bookingId]
    );

    // Also insert into reviews table linked to provider
    const reviewId = `rev-${Date.now()}`;
    const authorName = booking.customer_name || (req.user && req.user.name) || 'Verified Customer';
    const userId = booking.user_id || (req.user ? req.user.id : null);

    await pool.query(
      `INSERT INTO reviews (id, provider_id, user_id, author, rating, date, comment, helpful, verified_customer)
       VALUES (?, ?, ?, ?, ?, 'Just now', ?, 0, 1)`,
      [reviewId, booking.provider_id, userId, authorName, numRating, comment.trim()]
    );

    // Update technician aggregate rating
    await pool.query(
      `UPDATE providers
       SET
         rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE provider_id = ?),
         review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = ?)
       WHERE id = ?`,
      [booking.provider_id, booking.provider_id, booking.provider_id]
    );

    const newReview = {
      id: reviewId,
      bookingId,
      customerName: authorName,
      technicianName: booking.provider_name,
      serviceName: booking.service_name,
      rating: numRating,
      date: new Date().toISOString().split('T')[0],
      comment: comment.trim(),
      flagged: false,
    };

    return res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  addBookingReview,
};
