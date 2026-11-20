/**
 * Saved Providers Controller (Favorites / Bookmarks)
 * Handles adding, removing, and listing saved technicians using plain SQL queries.
 */

const pool = require('../config/db');

/**
 * GET /api/saved
 * Retrieve list of saved provider IDs for authenticated user
 */
async function getSavedProviders(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1; // Default to demo user if not logged in

    const [rows] = await pool.query(
      'SELECT provider_id FROM saved_providers WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const savedProviderIds = rows.map((r) => r.provider_id);

    return res.status(200).json({
      success: true,
      count: savedProviderIds.length,
      savedProviderIds,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/saved/:providerId
 * Bookmark/Save a technician
 */
async function saveProvider(req, res, next) {
  try {
    const { providerId } = req.params;
    const userId = req.user ? req.user.id : 1;

    // Check if provider exists
    const [providers] = await pool.query('SELECT id FROM providers WHERE id = ? LIMIT 1', [providerId]);
    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found.',
      });
    }

    // Insert or ignore if already saved
    await pool.query(
      'INSERT IGNORE INTO saved_providers (user_id, provider_id) VALUES (?, ?)',
      [userId, providerId]
    );

    return res.status(200).json({
      success: true,
      message: 'Technician saved to your favorites!',
      providerId,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/saved/:providerId
 * Remove a technician from favorites
 */
async function unsaveProvider(req, res, next) {
  try {
    const { providerId } = req.params;
    const userId = req.user ? req.user.id : 1;

    await pool.query(
      'DELETE FROM saved_providers WHERE user_id = ? AND provider_id = ?',
      [userId, providerId]
    );

    return res.status(200).json({
      success: true,
      message: 'Technician removed from favorites.',
      providerId,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSavedProviders,
  saveProvider,
  unsaveProvider,
};

