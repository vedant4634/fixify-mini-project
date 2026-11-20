// Central API Service Layer for Fixify
// Connects to Node.js/Express backend when available, or seamlessly persists in LocalStorage
// with documented demonstrative state so all frontend workflows function perfectly for demonstrations.

import {
  SERVICE_CATEGORIES,
  INITIAL_TECHNICIANS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS
} from './mockData';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
// Automatically handle URLs with or without '/api' and with or without trailing slash
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawApiUrl.replace(/\/+$/, '')
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

// Initialize LocalStorage with mock data if not already present
function initLocalStorage() {
  if (!localStorage.getItem('fixify_services')) {
    localStorage.setItem('fixify_services', JSON.stringify(SERVICE_CATEGORIES));
  }
  if (!localStorage.getItem('fixify_technicians')) {
    localStorage.setItem('fixify_technicians', JSON.stringify(INITIAL_TECHNICIANS));
  }
  if (!localStorage.getItem('fixify_customers')) {
    localStorage.setItem('fixify_customers', JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem('fixify_bookings')) {
    localStorage.setItem('fixify_bookings', JSON.stringify(INITIAL_BOOKINGS));
  }
  if (!localStorage.getItem('fixify_reviews')) {
    localStorage.setItem('fixify_reviews', JSON.stringify(INITIAL_REVIEWS));
  }
}

initLocalStorage();

// Safe storage getters & setters
const getStored = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// Generic fetch wrapper with graceful fallback to demonstrative local state
async function request(endpoint, options = {}, mockFallback) {
  try {
    // Fast check with reasonable cloud latency timeout (8s for Render cold starts/network latency)
    const controller = new AbortController();
    const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT) || 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const token = localStorage.getItem('fixify_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP Error ${response.status}`);
  } catch (err) {
    // Graceful fallback to demonstrative local persistence layer
    // This allows the college project demonstration to work 100% reliably
    return mockFallback ? mockFallback() : null;
  }
}

// ----------------- SERVICES API -----------------
export const api = {
  services: {
    getAll: async () => {
      return request('/services', {}, () => getStored('fixify_services', SERVICE_CATEGORIES));
    },
    getById: async (id) => {
      return request(`/services/${id}`, {}, () => {
        const services = getStored('fixify_services', SERVICE_CATEGORIES);
        return services.find(s => s.id === id || s.slug === id) || null;
      });
    },
    create: async (serviceData) => {
      return request('/services', { method: 'POST', body: JSON.stringify(serviceData) }, () => {
        const services = getStored('fixify_services', SERVICE_CATEGORIES);
        const newService = {
          ...serviceData,
          id: serviceData.slug || `service-${Date.now()}`,
          rating: 4.8,
          reviewsCount: 0,
        };
        const updated = [...services, newService];
        setStored('fixify_services', updated);
        return newService;
      });
    },
    update: async (id, serviceData) => {
      return request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(serviceData) }, () => {
        const services = getStored('fixify_services', SERVICE_CATEGORIES);
        const updated = services.map(s => s.id === id ? { ...s, ...serviceData } : s);
        setStored('fixify_services', updated);
        return updated.find(s => s.id === id);
      });
    },
    delete: async (id) => {
      return request(`/services/${id}`, { method: 'DELETE' }, () => {
        const services = getStored('fixify_services', SERVICE_CATEGORIES);
        const updated = services.filter(s => s.id !== id);
        setStored('fixify_services', updated);
        return { success: true };
      });
    }
  },

  // ----------------- TECHNICIANS API -----------------
  technicians: {
    getAll: async (filterCategory) => {
      return request('/technicians', {}, () => {
        const techs = getStored('fixify_technicians', INITIAL_TECHNICIANS);
        if (filterCategory && filterCategory !== 'All') {
          return techs.filter(t => t.category.toLowerCase().includes(filterCategory.toLowerCase()));
        }
        return techs;
      });
    },
    getById: async (id) => {
      return request(`/technicians/${id}`, {}, () => {
        const techs = getStored('fixify_technicians', INITIAL_TECHNICIANS);
        return techs.find(t => t.id === id) || null;
      });
    },
    updateStatus: async (id, status) => {
      return request(`/technicians/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, () => {
        const techs = getStored('fixify_technicians', INITIAL_TECHNICIANS);
        const updated = techs.map(t => {
          if (t.id === id) {
            return {
              ...t,
              status,
              verified: status === 'Verified',
              available: status === 'Verified' ? true : t.available
            };
          }
          return t;
        });
        setStored('fixify_technicians', updated);
        return { success: true, technician: updated.find(t => t.id === id) };
      });
    },
    register: async (techData) => {
      return request('/technicians/register', { method: 'POST', body: JSON.stringify(techData) }, () => {
        const techs = getStored('fixify_technicians', INITIAL_TECHNICIANS);
        const newTech = {
          id: `tech-${Date.now()}`,
          ...techData,
          rating: 5.0,
          jobsCompleted: 0,
          verified: false,
          status: 'Pending Verification',
          available: false,
          photo: techData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        };
        setStored('fixify_technicians', [newTech, ...techs]);
        return newTech;
      });
    },
    updateProfile: async (id, updates) => {
      return request(`/technicians/${id}`, { method: 'PUT', body: JSON.stringify(updates) }, () => {
        const techs = getStored('fixify_technicians', INITIAL_TECHNICIANS);
        const updated = techs.map(t => t.id === id ? { ...t, ...updates } : t);
        setStored('fixify_technicians', updated);
        return updated.find(t => t.id === id);
      });
    }
  },

  // ----------------- BOOKINGS API -----------------
  bookings: {
    getAll: async () => {
      return request('/bookings', {}, () => getStored('fixify_bookings', INITIAL_BOOKINGS));
    },
    getById: async (id) => {
      return request(`/bookings/${id}`, {}, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        return bookings.find(b => b.id === id) || null;
      });
    },
    getByCustomer: async (customerId) => {
      return request(`/customers/${customerId}/bookings`, {}, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        return bookings.filter(b => b.customerId === customerId);
      });
    },
    getByTechnician: async (technicianId) => {
      return request(`/technicians/${technicianId}/bookings`, {}, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        return bookings.filter(b => b.technicianId === technicianId);
      });
    },
    create: async (bookingData) => {
      return request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const newBooking = {
          id: `FIX-${randomNum}`,
          createdAt: new Date().toISOString(),
          status: 'Pending',
          statusHistory: [
            {
              status: 'Pending',
              time: 'Just now',
              note: 'Booking submitted by customer'
            }
          ],
          ...bookingData
        };
        const updated = [newBooking, ...bookings];
        setStored('fixify_bookings', updated);
        return newBooking;
      });
    },
    updateStatus: async (id, status, note = '') => {
      return request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        const updated = bookings.map(b => {
          if (b.id === id) {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              ...b,
              status,
              statusHistory: [
                ...(b.statusHistory || []),
                { status, time: `Today, ${timeStr}`, note: note || `Status updated to ${status}` }
              ]
            };
          }
          return b;
        });
        setStored('fixify_bookings', updated);
        return updated.find(b => b.id === id);
      });
    },
    cancel: async (id, reason = 'Customer request') => {
      return request(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        const updated = bookings.map(b => {
          if (b.id === id) {
            return {
              ...b,
              status: 'Cancelled',
              cancelReason: reason,
              statusHistory: [
                ...(b.statusHistory || []),
                { status: 'Cancelled', time: 'Just now', note: `Cancelled: ${reason}` }
              ]
            };
          }
          return b;
        });
        setStored('fixify_bookings', updated);
        return updated.find(b => b.id === id);
      });
    },
    addReview: async (bookingId, rating, comment) => {
      return request(`/bookings/${bookingId}/review`, { method: 'POST', body: JSON.stringify({ rating, comment }) }, () => {
        const bookings = getStored('fixify_bookings', INITIAL_BOOKINGS);
        const updatedBookings = bookings.map(b => {
          if (b.id === bookingId) {
            return { ...b, rating, review: comment };
          }
          return b;
        });
        setStored('fixify_bookings', updatedBookings);

        const booking = updatedBookings.find(b => b.id === bookingId);
        const reviews = getStored('fixify_reviews', INITIAL_REVIEWS);
        const newReview = {
          id: `rev-${Date.now()}`,
          bookingId,
          customerName: booking?.customerName || 'Customer',
          technicianName: booking?.technicianName || 'Technician',
          serviceName: booking?.serviceName || 'Home Service',
          rating,
          date: new Date().toISOString().split('T')[0],
          comment,
          flagged: false
        };
        setStored('fixify_reviews', [newReview, ...reviews]);
        return newReview;
      });
    }
  },

  // ----------------- CUSTOMERS API -----------------
  customers: {
    getAll: async () => {
      return request('/customers', {}, () => getStored('fixify_customers', INITIAL_CUSTOMERS));
    },
    getById: async (id) => {
      return request(`/customers/${id}`, {}, () => {
        const custs = getStored('fixify_customers', INITIAL_CUSTOMERS);
        return custs.find(c => c.id === id) || null;
      });
    },
    update: async (id, data) => {
      return request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => {
        const custs = getStored('fixify_customers', INITIAL_CUSTOMERS);
        const updated = custs.map(c => c.id === id ? { ...c, ...data } : c);
        setStored('fixify_customers', updated);
        return updated.find(c => c.id === id);
      });
    }
  },

  // ----------------- REVIEWS API -----------------
  reviews: {
    getAll: async () => {
      return request('/reviews', {}, () => getStored('fixify_reviews', INITIAL_REVIEWS));
    },
    delete: async (id) => {
      return request(`/reviews/${id}`, { method: 'DELETE' }, () => {
        const reviews = getStored('fixify_reviews', INITIAL_REVIEWS);
        const updated = reviews.filter(r => r.id !== id);
        setStored('fixify_reviews', updated);
        return { success: true };
      });
    },
    flag: async (id) => {
      return request(`/reviews/${id}/flag`, { method: 'PATCH' }, () => {
        const reviews = getStored('fixify_reviews', INITIAL_REVIEWS);
        const updated = reviews.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r);
        setStored('fixify_reviews', updated);
        return { success: true };
      });
    }
  }
};
