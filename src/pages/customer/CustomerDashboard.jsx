import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await api.bookings.getAll();
        // Show customer bookings or all recent demo bookings
        setBookings(data || []);
      } catch (err) {
        console.error('Failed to load customer dashboard bookings', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Technician Assigned').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
  const activeBooking = bookings.find((b) => b.status === 'In Progress' || b.status === 'On the Way');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-accent-orange uppercase tracking-wider font-heading">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading mt-1">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Track ongoing repairs, schedule new doorstep visits, and view service warranties.
          </p>
        </div>

        <Link
          to="/customer/book-service"
          className="px-5 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Book a Service</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-vanilla text-primary-navy flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6 text-primary-navy" />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Total Bookings</span>
            <span className="text-2xl font-extrabold text-primary-navy font-heading">
              {totalBookings}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Pending / Upcoming</span>
            <span className="text-2xl font-extrabold text-primary-navy font-heading">
              {pendingBookings}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Completed Jobs</span>
            <span className="text-2xl font-extrabold text-primary-navy font-heading">
              {completedBookings}
            </span>
          </div>
        </div>
      </div>

      {/* Active In-Progress Alert if available */}
      {activeBooking && (
        <div className="bg-white p-6 rounded-2xl border-2 border-secondary-blue shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Clock className="w-5 h-5 text-secondary-blue" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-secondary-blue">
                    Service In Progress Today
                  </span>
                  <Badge status={activeBooking.status}>{activeBooking.status}</Badge>
                </div>
                <h3 className="text-base font-bold text-primary-navy mt-1">
                  {activeBooking.serviceName} &bull; Ref: {activeBooking.id}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Technician: <strong>{activeBooking.technicianName}</strong> ({activeBooking.technicianPhone})
                </p>
              </div>
            </div>

            <Link
              to={`/customer/track?id=${activeBooking.id}`}
              className="px-4 py-2 bg-secondary-blue hover:bg-primary-navy text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Track Live Timeline &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-primary-navy font-heading">
              Recent Bookings
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Review your scheduled and previously completed home repairs
            </p>
          </div>

          <Link
            to="/customer/bookings"
            className="text-xs font-semibold text-secondary-blue hover:text-primary-navy flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-text-muted">No bookings found yet.</p>
            <Link
              to="/customer/book-service"
              className="mt-3 inline-block px-4 py-2 bg-primary-navy text-white text-xs font-semibold rounded-lg"
            >
              Book your first service
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle overflow-x-auto">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-vanilla/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-vanilla text-primary-navy flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-secondary-blue" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-primary-navy">{booking.serviceName}</h4>
                      <Badge status={booking.status}>{booking.status}</Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      ID: <span className="font-mono">{booking.id}</span> &bull; {booking.date} ({booking.timeSlot})
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Technician: <strong>{booking.technicianName}</strong> &bull; Location: {booking.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <span className="text-[11px] text-text-muted block">Estimated</span>
                    <span className="text-sm font-bold text-primary-navy">₹{booking.estimatedPrice}</span>
                  </div>

                  <Link
                    to="/customer/bookings"
                    className="px-3 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
