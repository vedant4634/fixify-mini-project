import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import PublicLayout from './components/common/PublicLayout';
import CustomerLayout from './components/customer/CustomerLayout';
import TechnicianLayout from './components/technician/TechnicianLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import CustomerLogin from './pages/auth/CustomerLogin';
import CustomerSignup from './pages/auth/CustomerSignup';
import ForgotPassword from './pages/auth/ForgotPassword';
import TechnicianLogin from './pages/auth/TechnicianLogin';
import TechnicianRegister from './pages/auth/TechnicianRegister';
import AdminLogin from './pages/auth/AdminLogin';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerBookService from './pages/customer/CustomerBookService';
import CustomerTrackBooking from './pages/customer/CustomerTrackBooking';
import CustomerAddresses from './pages/customer/CustomerAddresses';
import CustomerReviews from './pages/customer/CustomerReviews';
import CustomerProfile from './pages/customer/CustomerProfile';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianRequests from './pages/technician/TechnicianRequests';
import TechnicianJobs from './pages/technician/TechnicianJobs';
import TechnicianAvailability from './pages/technician/TechnicianAvailability';
import TechnicianEarnings from './pages/technician/TechnicianEarnings';
import TechnicianProfile from './pages/technician/TechnicianProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminTechnicians from './pages/admin/AdminTechnicians';
import AdminServices from './pages/admin/AdminServices';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            {/* PUBLIC ROUTES (With Main Navbar & Footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* AUTHENTICATION ROUTES */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/signup" element={<CustomerSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/technician/login" element={<TechnicianLogin />} />
            <Route path="/technician/register" element={<TechnicianRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* CUSTOMER PROTECTED ROUTES */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="bookings" element={<CustomerBookings />} />
              <Route path="book-service" element={<CustomerBookService />} />
              <Route path="track" element={<CustomerTrackBooking />} />
              <Route path="addresses" element={<CustomerAddresses />} />
              <Route path="reviews" element={<CustomerReviews />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Also allow direct access to /customer/book-service if navigated from public service pages */}
            <Route
              path="/book-service"
              element={<Navigate to="/customer/book-service" replace />}
            />

            {/* TECHNICIAN PROTECTED ROUTES */}
            <Route
              path="/technician"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/technician/dashboard" replace />} />
              <Route path="dashboard" element={<TechnicianDashboard />} />
              <Route path="requests" element={<TechnicianRequests />} />
              <Route path="jobs" element={<TechnicianJobs />} />
              <Route path="availability" element={<TechnicianAvailability />} />
              <Route path="earnings" element={<TechnicianEarnings />} />
              <Route path="profile" element={<TechnicianProfile />} />
            </Route>

            {/* ADMIN PROTECTED ROUTES */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="technicians" element={<AdminTechnicians />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* CATCH ALL 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-vanilla flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-navy text-accent-orange flex items-center justify-center font-extrabold text-2xl font-heading shadow-md mb-4">
                    404
                  </div>
                  <h1 className="text-2xl font-bold text-primary-navy font-heading">
                    Page Not Found
                  </h1>
                  <p className="text-xs text-text-muted mt-2 max-w-sm">
                    The page or service you are trying to visit does not exist or has been relocated.
                  </p>
                  <a
                    href="/"
                    className="mt-6 px-5 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Return to Fixify Home
                  </a>
                </div>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
