/**
 * Fixify REST API Server
 * Node.js + Express + MySQL Production Backend
 * Powers local technician search, geospatial Haversine proximity,
 * bookings, customer reviews, administration, and JWT authentication.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkDbHealth } = require('./config/db');

// Import modular route handlers
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const savedRoutes = require('./routes/savedRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Import middlewares
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
const startTime = new Date();

// ====================================================================
// CORS CONFIGURATION
// ====================================================================
// Allowed origins include production frontend on Render, custom FRONTEND_URL,
// and localhost for local development.

const configuredFrontend = process.env.FRONTEND_URL || process.env.CLIENT_URL;

const allowedOrigins = [
  'https://fixify-trusted-local-home-service.onrender.com',
  'https://fixify-trusted-local-home-service.onrender.com/',
];

if (configuredFrontend) {
  allowedOrigins.push(configuredFrontend);
  // Add variation without trailing slash if present
  if (configuredFrontend.endsWith('/')) {
    allowedOrigins.push(configuredFrontend.slice(0, -1));
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow non-browser requests (e.g. mobile apps, curl, server-to-server, Render health checks)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Allow explicitly listed production frontend URLs
      const normalizedOrigin = origin.replace(/\/$/, '');
      const match = allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === normalizedOrigin);
      if (match) {
        return callback(null, true);
      }

      // 3. Allow local development (localhost and 127.0.0.1 on any port)
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      // 4. Reject foreign origins in production
      if (process.env.NODE_ENV === 'production') {
        const error = new Error(`CORS blocked: Origin "${origin}" is not authorized.`);
        error.status = 403;
        return callback(error, false);
      }

      // Permissive fallback in local development
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development request logger
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ====================================================================
// HEALTH-CHECK ENDPOINTS
// ====================================================================
// Render and monitoring services can probe either GET /health or GET /api/health.
// Returns HTTP 200 even when external database is pending connection,
// reporting transparent database health status in JSON response.

async function handleHealthCheck(req, res) {
  const dbHealth = await checkDbHealth();
  const uptimeSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);

  res.status(200).json({
    status: 'healthy',
    service: 'Fixify Backend Web Service',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: {
      connected: dbHealth.connected,
      host: dbHealth.host,
      database: dbHealth.database,
      message: dbHealth.connected ? 'Operational' : 'Disconnected / Pending Cloud Database Setup',
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
    },
    version: '1.0.0',
  });
}

// Root health-check endpoint (standard Render default)
app.get('/health', handleHealthCheck);

// API namespaced health-check endpoint
app.get('/api/health', handleHealthCheck);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Fixify API Server',
    description: 'Trusted Local Home Services REST API',
    documentation: 'See /api/health for system status',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      services: '/api/services',
      technicians: '/api/technicians',
      providers: '/api/providers',
      bookings: '/api/bookings',
      customers: '/api/customers',
      reviews: '/api/reviews',
      admin: '/api/admin/stats',
    },
  });
});

// ====================================================================
// API ROUTE REGISTRATIONS
// ====================================================================

// Authentication & Profile
app.use('/api/auth', authRoutes);
app.use('/api/profile', authRoutes);

// Services & Categories
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);

// Technicians & Providers (both aliases supported seamlessly)
app.use('/api/technicians', providerRoutes);
app.use('/api/providers', providerRoutes);

// Bookings
app.use('/api/bookings', bookingRoutes);

// Customers
app.use('/api/customers', customerRoutes);

// Reviews
app.use('/api/reviews', reviewRoutes);

// Admin
app.use('/api/admin', adminRoutes);

// Saved Technicians (Favorites)
app.use('/api/saved', savedRoutes);

// ====================================================================
// ERROR HANDLING & 404
// ====================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ====================================================================
// SERVER INITIALIZATION & GRACEFUL SHUTDOWN
// ====================================================================

const server = app.listen(PORT, HOST, () => {
  console.log('\n====================================================');
  console.log(`🚀 Fixify Backend Server running at http://${HOST}:${PORT}`);
  console.log(`🏥 Health Check:     http://${HOST}:${PORT}/health`);
  console.log(`🏥 API Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 Allowed Frontend: ${configuredFrontend || 'https://fixify-trusted-local-home-service.onrender.com'}`);
  console.log('====================================================\n');
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close((err) => {
    if (err) {
      console.error('❌ Error during HTTP server close:', err);
      process.exit(1);
    }
    console.log('✅ HTTP server closed cleanly.');
    process.exit(0);
  });

  // Force shutdown if cleanup takes longer than 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Process-level unexpected error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception in Fixify server:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, server };
