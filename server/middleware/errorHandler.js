/**
 * Centralized Error & Not Found Middleware
 * Provides uniform JSON error responses across the Fixify API.
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(`💥 [Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Provide helpful feedback for database connection issues without crashing
  if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'EACCES' ||
    err.code === 'PROTOCOL_CONNECTION_LOST' ||
    err.code === 'ER_ACCESS_DENIED_ERROR' ||
    err.name === 'AggregateError'
  ) {
    message = 'Database connection currently unavailable. Please verify DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in environment variables.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
