/**
 * Providers & Technicians Controller
 * Handles technician search, SQL Haversine geospatial filtering, provider details,
 * review submissions, technician registration, and status updates using plain SQL queries.
 */

const pool = require('../config/db');

/**
 * Helper to safely parse JSON columns from MySQL
 */
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
 * Format a database provider row into the shape expected by the frontend
 */
function formatProvider(row, services = [], reviews = []) {
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name || row.name,
    category: row.category_id || 'general',
    categoryName: row.category_name || row.category_id,
    photo: row.photo,
    coverPhoto: row.cover_photo || row.photo,
    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.review_count) || 0,
    reviewsCount: Number(row.review_count) || 0,
    startingPrice: Number(row.starting_price) || 299,
    hourlyRate: Number(row.starting_price) || 299,
    verified: Boolean(row.verified),
    status: row.verified ? 'Verified' : 'Pending Verification',
    available: Boolean(row.available),
    experience: row.experience || '3+ yrs',
    jobsCompleted: Number(row.jobs_completed) || 0,
    responseTime: row.response_time || '< 15 mins',
    city: row.city || 'Mumbai',
    area: row.area || row.city,
    lat: row.lat ? Number(row.lat) : 19.0760,
    lng: row.lng ? Number(row.lng) : 72.8777,
    address: row.address,
    about: row.about,
    bio: row.about,
    skills: row.about || (services.length > 0 ? services.map(s => s.name).join(', ') : 'Standard maintenance'),
    badges: safeParseJson(row.badges, ['Verified Pro']),
    gallery: safeParseJson(row.gallery, [row.photo]),
    distance: row.distance !== undefined && row.distance !== null ? Math.round(Number(row.distance) * 10) / 10 : null,
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      duration: s.duration,
      desc: s.description,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      author: r.author,
      rating: Number(r.rating),
      date: r.date,
      comment: r.comment,
      helpful: Number(r.helpful || 0),
      verifiedCustomer: Boolean(r.verified_customer),
    })),
  };
}

/**
 * GET /api/providers and /api/technicians
 */
async function getProviders(req, res, next) {
  try {
    const {
      category,
      search,
      searchQuery,
      lat,
      lng,
      maxDistance,
      minPrice,
      maxPrice,
      minRating,
      available,
      verified,
      sort,
      sortBy = 'recommended',
    } = req.query;

    const searchTerm = (search || searchQuery || '').trim();
    const activeSort = sort || sortBy;

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const hasLocation = !isNaN(userLat) && !isNaN(userLng) && userLat !== null && userLng !== null;

    let selectFields = `p.*`;
    const queryParams = [];

    if (hasLocation) {
      selectFields += `,
        (6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(?)) * cos(radians(p.lat)) * cos(radians(p.lng) - radians(?)) +
            sin(radians(?)) * sin(radians(p.lat))
          ))
        )) AS distance
      `;
      queryParams.push(userLat, userLng, userLat);
    } else {
      selectFields += `, NULL AS distance`;
    }

    let sql = `SELECT ${selectFields} FROM providers p WHERE 1=1`;

    if (category && category !== 'all' && category !== 'All') {
      sql += ` AND (LOWER(p.category_id) = LOWER(?) OR LOWER(p.category_name) LIKE LOWER(?))`;
      queryParams.push(category, `%${category}%`);
    }

    if (searchTerm) {
      const wildcard = `%${searchTerm}%`;
      sql += ` AND (
        p.name LIKE ? OR
        p.business_name LIKE ? OR
        p.category_name LIKE ? OR
        p.area LIKE ? OR
        p.city LIKE ? OR
        EXISTS (
          SELECT 1 FROM services s
          WHERE s.provider_id = p.id
            AND (s.name LIKE ? OR s.description LIKE ?)
        )
      )`;
      queryParams.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
    }

    if (minRating && Number(minRating) > 0) {
      sql += ` AND p.rating >= ?`;
      queryParams.push(Number(minRating));
    }

    if (minPrice && Number(minPrice) > 0) {
      sql += ` AND p.starting_price >= ?`;
      queryParams.push(Number(minPrice));
    }
    if (maxPrice && Number(maxPrice) > 0) {
      sql += ` AND p.starting_price <= ?`;
      queryParams.push(Number(maxPrice));
    }

    if (verified === 'true' || verified === '1') {
      sql += ` AND p.verified = 1`;
    }

    if (available === 'true' || available === '1') {
      sql += ` AND p.available = 1`;
    }

    if (hasLocation && maxDistance && Number(maxDistance) > 0) {
      sql += ` HAVING distance <= ?`;
      queryParams.push(Number(maxDistance));
    }

    switch (activeSort) {
      case 'nearest':
        sql += hasLocation ? ` ORDER BY distance ASC` : ` ORDER BY p.rating DESC`;
        break;
      case 'price-asc':
        sql += ` ORDER BY p.starting_price ASC`;
        break;
      case 'rating-desc':
        sql += ` ORDER BY p.rating DESC, p.review_count DESC`;
        break;
      case 'reviews-desc':
        sql += ` ORDER BY p.review_count DESC`;
        break;
      case 'recommended':
      default:
        sql += ` ORDER BY p.verified DESC, (p.rating * LOG10(p.review_count + 5)) DESC`;
        break;
    }

    const [rows] = await pool.query(sql, queryParams);

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        providers: [],
        technicians: [],
      });
    }

    const providerIds = rows.map((r) => r.id);
    const placeholders = providerIds.map(() => '?').join(',');

    const [services] = await pool.query(
      `SELECT * FROM services WHERE provider_id IN (${placeholders})`,
      providerIds
    );

    const [reviews] = await pool.query(
      `SELECT * FROM reviews WHERE provider_id IN (${placeholders}) ORDER BY created_at DESC`,
      providerIds
    );

    const servicesMap = {};
    for (const s of services) {
      if (!servicesMap[s.provider_id]) servicesMap[s.provider_id] = [];
      servicesMap[s.provider_id].push(s);
    }

    const reviewsMap = {};
    for (const r of reviews) {
      if (!reviewsMap[r.provider_id]) reviewsMap[r.provider_id] = [];
      reviewsMap[r.provider_id].push(r);
    }

    const formattedProviders = rows.map((row) =>
      formatProvider(row, servicesMap[row.id] || [], reviewsMap[row.id] || [])
    );

    return res.status(200).json(formattedProviders);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/providers/:id and /api/technicians/:id
 */
async function getProviderById(req, res, next) {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const hasLocation = !isNaN(userLat) && !isNaN(userLng) && userLat !== null && userLng !== null;

    let sql = '';
    let finalParams = [];

    if (hasLocation) {
      sql = `
        SELECT p.*,
          (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(?)) * cos(radians(p.lat)) * cos(radians(p.lng) - radians(?)) +
              sin(radians(?)) * sin(radians(p.lat))
            ))
          )) AS distance
        FROM providers p
        WHERE p.id = ?
        LIMIT 1
      `;
      finalParams = [userLat, userLng, userLat, id];
    } else {
      sql = `SELECT p.*, NULL AS distance FROM providers p WHERE p.id = ? LIMIT 1`;
      finalParams = [id];
    }

    const [rows] = await pool.query(sql, finalParams);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Technician with ID "${id}" was not found.`,
      });
    }

    const providerRow = rows[0];

    const [services] = await pool.query(
      'SELECT * FROM services WHERE provider_id = ? ORDER BY price ASC',
      [id]
    );

    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE provider_id = ? ORDER BY created_at DESC',
      [id]
    );

    const formatted = formatProvider(providerRow, services, reviews);

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/technicians/:id/status
 * Admin update technician verification status
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isVerified = status === 'Verified' || status === true || status === 1;

    const [existing] = await pool.query('SELECT * FROM providers WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Technician not found.' });
    }

    await pool.query('UPDATE providers SET verified = ?, available = ? WHERE id = ?', [
      isVerified ? 1 : 0,
      isVerified ? 1 : 0,
      id,
    ]);

    const [updated] = await pool.query('SELECT * FROM providers WHERE id = ? LIMIT 1', [id]);
    const formatted = formatProvider(updated[0]);

    return res.status(200).json({
      success: true,
      message: `Technician status updated to ${status}.`,
      technician: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/technicians/register
 * Register a new technician partner
 */
async function registerTechnician(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      city = 'Mumbai',
      category = 'Plumbing',
      skills = '',
      experience = '3+ yrs',
      bio = '',
      hourlyRate = 350,
      photo,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    const techId = `tech-${Date.now()}`;
    const defaultPhoto = photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';

    // Map category string to category_id
    const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || 'plumber';

    // Insert into providers
    await pool.query(
      `INSERT INTO providers (
        id, name, business_name, category_id, category_name, photo,
        rating, review_count, starting_price, verified, available,
        experience, jobs_completed, response_time, city, area,
        lat, lng, address, about, badges, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, 5.0, 0, ?, 0, 0, ?, 0, '< 15 mins', ?, ?, 19.0760, 72.8777, ?, ?, '["Registered Partner"]', '[]')`,
      [
        techId,
        name.trim(),
        `${name.trim()} Services`,
        categoryId,
        category,
        defaultPhoto,
        Number(hourlyRate) || 350,
        experience,
        city,
        city,
        address || city,
        bio || skills || 'Experienced home technician',
      ]
    );

    const [created] = await pool.query('SELECT * FROM providers WHERE id = ? LIMIT 1', [techId]);
    const formatted = formatProvider(created[0]);

    return res.status(201).json({
      success: true,
      message: 'Technician registration submitted for verification.',
      technician: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/technicians/:id
 * Update technician profile
 */
async function updateProvider(req, res, next) {
  try {
    const { id } = req.params;
    const { name, phone, city, category, experience, bio, hourlyRate, startingPrice } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (city) {
      updates.push('city = ?');
      params.push(city);
    }
    if (category) {
      updates.push('category_name = ?');
      params.push(category);
    }
    if (experience) {
      updates.push('experience = ?');
      params.push(experience);
    }
    if (bio) {
      updates.push('about = ?');
      params.push(bio);
    }
    const rate = hourlyRate || startingPrice;
    if (rate) {
      updates.push('starting_price = ?');
      params.push(Number(rate));
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE providers SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM providers WHERE id = ? LIMIT 1', [id]);
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Technician not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Technician profile updated.',
      technician: formatProvider(updated[0]),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/technicians/:id/bookings
 */
async function getProviderBookings(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE provider_id = ? ORDER BY created_at DESC',
      [id]
    );
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/providers/:id/reviews
 */
async function addReview(req, res, next) {
  try {
    const { id: providerId } = req.params;
    const { rating, comment, author } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required.',
      });
    }

    const reviewerName = (req.user && req.user.name) || author || 'Verified Customer';
    const userId = req.user ? req.user.id : null;

    const [providers] = await pool.query('SELECT id FROM providers WHERE id = ? LIMIT 1', [providerId]);
    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found.',
      });
    }

    const reviewId = `rev-${Date.now()}`;
    const numRating = parseFloat(rating);

    await pool.query(
      `INSERT INTO reviews (id, provider_id, user_id, author, rating, date, comment, helpful, verified_customer)
       VALUES (?, ?, ?, ?, ?, 'Just now', ?, 0, 1)`,
      [reviewId, providerId, userId, reviewerName, numRating, comment.trim()]
    );

    await pool.query(
      `UPDATE providers
       SET
         rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE provider_id = ?),
         review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = ?)
       WHERE id = ?`,
      [providerId, providerId, providerId]
    );

    const newReview = {
      id: reviewId,
      author: reviewerName,
      rating: numRating,
      date: 'Just now',
      comment: comment.trim(),
      helpful: 0,
      verifiedCustomer: true,
    };

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review: newReview,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProviders,
  getProviderById,
  updateStatus,
  registerTechnician,
  updateProvider,
  getProviderBookings,
  addReview,
};
