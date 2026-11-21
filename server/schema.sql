-- ====================================================================
-- FIXIFY - HOME SERVICES MARKETPLACE DATABASE SCHEMA
-- Relational MySQL Schema (3NF Normalization)
-- ====================================================================

-- Create Database if it does not already exist
CREATE DATABASE IF NOT EXISTS mpfixfy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mpfixfy;

-- Disable foreign key checks during schema rebuild
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS saved_providers;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores registered customers, service technicians, and admins.
-- Passwords are encrypted using bcrypt hashing.
-- --------------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- Service trades (e.g., AC Repair, Plumbing, Electrical, Carpentry).
-- --------------------------------------------------------------------
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  image VARCHAR(500) DEFAULT NULL,
  description TEXT,
  starting_price INT NOT NULL DEFAULT 199,
  popular_services JSON DEFAULT NULL,
  badge VARCHAR(60) DEFAULT NULL,
  accent_color VARCHAR(150) DEFAULT NULL,
  border_color VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. PROVIDERS TABLE
-- Technicians and trade specialists in Pune, Kolhapur, and Mumbai.
-- Includes geographic coordinates (lat/lng) for Haversine distance calculations.
-- --------------------------------------------------------------------
CREATE TABLE providers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  business_name VARCHAR(150) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  photo VARCHAR(500) NOT NULL,
  cover_photo VARCHAR(500) DEFAULT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  review_count INT NOT NULL DEFAULT 0,
  starting_price INT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  experience VARCHAR(50) NOT NULL DEFAULT '3+ yrs',
  jobs_completed INT NOT NULL DEFAULT 0,
  response_time VARCHAR(50) NOT NULL DEFAULT '< 15 mins',
  city VARCHAR(80) NOT NULL,
  area VARCHAR(120) NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  address TEXT NOT NULL,
  about TEXT NOT NULL,
  badges JSON DEFAULT NULL,
  gallery JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_providers_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_providers_category (category_id),
  INDEX idx_providers_city (city),
  INDEX idx_providers_coords (lat, lng),
  INDEX idx_providers_price (starting_price),
  INDEX idx_providers_rating (rating),
  INDEX idx_providers_verified (verified),
  INDEX idx_providers_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. SERVICES TABLE
-- Standardized price list and packages offered by each provider.
-- --------------------------------------------------------------------
CREATE TABLE services (
  id VARCHAR(50) PRIMARY KEY,
  provider_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  price INT NOT NULL,
  duration VARCHAR(60) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_provider FOREIGN KEY (provider_id)
    REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_services_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. REVIEWS TABLE
-- Customer reviews and verified ratings for technicians.
-- --------------------------------------------------------------------
CREATE TABLE reviews (
  id VARCHAR(50) PRIMARY KEY,
  provider_id VARCHAR(50) NOT NULL,
  user_id INT DEFAULT NULL,
  author VARCHAR(120) NOT NULL,
  rating DECIMAL(2, 1) NOT NULL,
  date VARCHAR(60) DEFAULT 'Just now',
  comment TEXT NOT NULL,
  helpful INT NOT NULL DEFAULT 0,
  verified_customer BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_provider FOREIGN KEY (provider_id)
    REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_reviews_provider (provider_id),
  INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. BOOKINGS TABLE
-- Service appointment orders with itemized pricing, taxes, and status.
-- --------------------------------------------------------------------
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT DEFAULT NULL,
  provider_id VARCHAR(50) NOT NULL,
  provider_name VARCHAR(120) NOT NULL,
  business_name VARCHAR(150) DEFAULT NULL,
  category_name VARCHAR(100) DEFAULT NULL,
  provider_photo VARCHAR(500) DEFAULT NULL,
  service_name VARCHAR(150) NOT NULL,
  date VARCHAR(30) NOT NULL,
  time_slot VARCHAR(60) NOT NULL,
  status ENUM('Upcoming', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
  cancel_reason TEXT DEFAULT NULL,
  address TEXT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  notes TEXT DEFAULT NULL,
  price INT NOT NULL,
  taxes INT NOT NULL DEFAULT 0,
  platform_fee INT NOT NULL DEFAULT 49,
  total_amount INT NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  is_rated BOOLEAN NOT NULL DEFAULT FALSE,
  user_rating DECIMAL(2, 1) DEFAULT NULL,
  user_review TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id)
    REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_provider (provider_id),
  INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. SAVED_PROVIDERS TABLE (Favorites / Bookmarks)
-- Many-to-many relationship linking users with saved technicians.
-- --------------------------------------------------------------------
CREATE TABLE saved_providers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  provider_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_saved_provider FOREIGN KEY (provider_id)
    REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_user_provider UNIQUE (user_id, provider_id),
  INDEX idx_saved_user (user_id),
  INDEX idx_saved_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

