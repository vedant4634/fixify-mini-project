// Central API Service Layer for Fixify
// Connects directly to Node.js/Express + MySQL Backend (http://localhost:5000/api)
// Eliminates silent mock persistence so all mutations write directly to the database.

import {
  SERVICE_CATEGORIES,
  INITIAL_TECHNICIANS,
  INITIAL_REVIEWS
} from './mockData';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
// Automatically handle URLs with or without '/api' and with or without trailing slash
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawApiUrl.replace(/\/+$/, '')
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

/**
 * Robust fetch wrapper that talks directly to the backend.
 * Never silently fakes data for mutating operations (POST, PUT, PATCH, DELETE).
 * Throws clean descriptive error messages so forms and toasts reflect reality.
 */
async function request(endpoint, options = {}, allowReadFallback = false, fallbackData = null) {
  const isMutation = options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase());
  const controller = new AbortController();
  const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT) || 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = localStorage.getItem('fixify_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }

    // Parse backend JSON error message if returned
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.message) {
        errorMessage = errData.message;
      }
    } catch {
      // Body wasn't JSON
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  } catch (err) {
    clearTimeout(timeoutId);

    // If this is a mutation (e.g. signup, login, booking, review), ALWAYS throw
    if (isMutation) {
      if (err.name === 'AbortError') {
        throw new Error('Server request timed out. Please verify your backend server is running on http://localhost:5000.');
      }
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server at http://localhost:5000. Please ensure the backend is started.');
      }
      throw err;
    }

    // For read operations only (e.g. initial page load when backend is just starting)
    if (allowReadFallback && fallbackData !== null) {
      console.warn(`[Fixify API] Read-only fallback used for ${endpoint}:`, err.message);
      return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
    }

    throw err;
  }
}

export const api = {
  // ----------------- AUTHENTICATION API -----------------
  auth: {
    login: async (email, password) => {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
    },
    signup: async (formData) => {
      return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },
    getMe: async () => {
      return request('/auth/me');
    },
    updateProfile: async (data) => {
      return request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    changePassword: async (passwords) => {
      return request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(passwords),
      });
    },
  },

  // ----------------- SERVICES API -----------------
  services: {
    getAll: async () => {
      return request('/services', {}, true, SERVICE_CATEGORIES);
    },
    getById: async (id) => {
      return request(`/services/${id}`, {}, true, () => {
        return SERVICE_CATEGORIES.find((s) => s.id === id || s.slug === id) || null;
      });
    },
    create: async (serviceData) => {
      return request('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
    },
    update: async (id, serviceData) => {
      return request(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData),
      });
    },
    delete: async (id) => {
      return request(`/services/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ----------------- TECHNICIANS / PROVIDERS API -----------------
  technicians: {
    getAll: async (filterCategory) => {
      const query = filterCategory && filterCategory !== 'All' ? `?category=${encodeURIComponent(filterCategory)}` : '';
      return request(`/technicians${query}`, {}, true, INITIAL_TECHNICIANS);
    },
    getById: async (id) => {
      return request(`/technicians/${id}`, {}, true, () => {
        return INITIAL_TECHNICIANS.find((t) => t.id === id) || null;
      });
    },
    updateStatus: async (id, status) => {
      return request(`/technicians/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    register: async (techData) => {
      return request('/technicians/register', {
        method: 'POST',
        body: JSON.stringify(techData),
      });
    },
    updateProfile: async (id, updates) => {
      return request(`/technicians/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    getBookings: async (id) => {
      return request(`/technicians/${id}/bookings`);
    },
  },

  // ----------------- BOOKINGS API -----------------
  bookings: {
    getAll: async () => {
      return request('/bookings');
    },
    getById: async (id) => {
      return request(`/bookings/${id}`);
    },
    getByCustomer: async (customerId) => {
      return request(`/customers/${customerId}/bookings`);
    },
    getByTechnician: async (technicianId) => {
      return request(`/technicians/${technicianId}/bookings`);
    },
    create: async (bookingData) => {
      return request('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    },
    updateStatus: async (id, status, note = '') => {
      return request(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
    },
    cancel: async (id, reason = 'Customer request') => {
      return request(`/bookings/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    addReview: async (bookingId, rating, comment) => {
      return request(`/bookings/${bookingId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
    },
  },

  // ----------------- CUSTOMERS API -----------------
  customers: {
    getAll: async () => {
      return request('/customers');
    },
    getById: async (id) => {
      return request(`/customers/${id}`);
    },
    update: async (id, data) => {
      return request(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // ----------------- REVIEWS API -----------------
  reviews: {
    getAll: async () => {
      return request('/reviews', {}, true, INITIAL_REVIEWS);
    },
    create: async (reviewData) => {
      return request('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },
    delete: async (id) => {
      return request(`/reviews/${id}`, {
        method: 'DELETE',
      });
    },
    flag: async (id) => {
      return request(`/reviews/${id}/flag`, {
        method: 'PATCH',
      });
    },
  },

  // ----------------- ADMIN DASHBOARD API -----------------
  admin: {
    getStats: async () => {
      return request('/admin/stats');
    },
  },

  // ----------------- SAVED TECHNICIANS (FAVORITES) -----------------
  saved: {
    getAll: async () => {
      return request('/saved');
    },
    toggle: async (providerId) => {
      return request(`/saved/${providerId}`, {
        method: 'POST',
      });
    },
    remove: async (providerId) => {
      return request(`/saved/${providerId}`, {
        method: 'DELETE',
      });
    },
  },
};
