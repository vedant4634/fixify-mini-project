import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  XCircle,
  Star,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Compass,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function CustomerBookings() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await api.bookings.getAll();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }

  // Filter tabs
  const tabs = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  const filteredBookings = bookings.filter((b) => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'In Progress' && (b.status === 'In Progress' || b.status === 'On the Way' || b.status === 'Technician Assigned')) ||
      b.status.toLowerCase() === activeTab.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.technicianName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle Cancel Booking
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      setSubmittingAction(true);
      await api.bookings.cancel(bookingToCancel.id, 'Cancelled by customer via dashboard');
      toast.success(`Booking ${bookingToCancel.id} has been cancelled.`);
      setIsCancelOpen(false);
      setBookingToCancel(null);
      loadBookings();
    } catch (err) {
      toast.error('Failed to cancel booking.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    try {
      setSubmittingAction(true);
      await api.bookings.addReview(reviewBooking.id, rating, reviewComment);
      toast.success('Thank you! Your review has been recorded.');
      setIsReviewOpen(false);
      setReviewBooking(null);
      setReviewComment('');
      loadBookings();
    } catch (err) {
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            My Service Bookings
          </h1>
          <p className="text-xs text-text-muted mt-1">
            View status history, track assigned technicians, and review completed jobs
          </p>
        </div>

        <Link
          to="/customer/book-service"
          className="px-4 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          + Book New Service
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ID, service or technician..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary-navy text-white shadow-xs'
                  : 'bg-vanilla text-text-muted hover:text-primary-navy'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-12 text-center text-xs text-text-muted">
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-subtle p-12 text-center max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-primary-navy">No bookings found</h3>
          <p className="text-xs text-text-muted mt-1">
            There are no bookings matching the current filter.
          </p>
          <Link
            to="/customer/book-service"
            className="mt-4 inline-block px-4 py-2 bg-primary-navy text-white text-xs font-semibold rounded-lg"
          >
            Book a Service Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => {
            const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';
            const canReview = booking.status === 'Completed' && !booking.review;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-border-subtle p-5 shadow-xs hover:border-secondary-blue/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left Information */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold font-mono text-primary-navy bg-vanilla px-2 py-0.5 rounded border border-border-subtle">
                      {booking.id}
                    </span>
                    <h3 className="text-base font-bold text-primary-navy font-heading">
                      {booking.serviceName}
                    </h3>
                    <Badge status={booking.status}>{booking.status}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-secondary-blue" />
                      {booking.date} ({booking.timeSlot})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-secondary-blue" />
                      Technician: <strong className="text-primary-navy">{booking.technicianName}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secondary-blue" />
                      {booking.city}
                    </span>
                  </div>

                  {booking.description && (
                    <p className="text-xs text-text-muted line-clamp-1 italic">
                      "{booking.description}"
                    </p>
                  )}

                  {booking.review && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                      <Star className="w-3 h-3 fill-accent-orange text-accent-orange" />
                      <span>Rated: {booking.rating}/5 &bull; "{booking.review}"</span>
                    </div>
                  )}
                </div>

                {/* Right Actions & Price */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
                  <div className="lg:text-right pr-2">
                    <span className="text-[10px] text-text-muted uppercase block">Estimated</span>
                    <span className="text-base font-extrabold text-primary-navy">
                      ₹{booking.estimatedPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDetailsOpen(true);
                      }}
                      className="px-3 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle transition-colors flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {/* Track Booking */}
                    <Link
                      to={`/customer/track?id=${booking.id}`}
                      className="px-3 py-1.5 bg-secondary-blue hover:bg-primary-navy text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      title="Track Live Status"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </Link>

                    {/* Cancel Booking (when permitted) */}
                    {canCancel && (
                      <button
                        onClick={() => {
                          setBookingToCancel(booking);
                          setIsCancelOpen(true);
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                        title="Cancel Booking"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Review Service (when completed) */}
                    {canReview && (
                      <button
                        onClick={() => {
                          setReviewBooking(booking);
                          setIsReviewOpen(true);
                        }}
                        className="px-3 py-1.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILS MODAL */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Booking Details: ${selectedBooking?.id}`}
        maxWidth="max-w-xl"
      >
        {selectedBooking && (
          <div className="space-y-5 text-xs text-text-main">
            <div className="flex justify-between items-center p-3 rounded-lg bg-vanilla/60 border border-border-subtle">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted">Status</span>
                <p className="mt-0.5">
                  <Badge status={selectedBooking.status}>{selectedBooking.status}</Badge>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-text-muted">Estimated Price</span>
                <p className="text-base font-bold text-primary-navy">₹{selectedBooking.estimatedPrice}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-border-subtle">
              <div>
                <span className="text-text-muted block">Service:</span>
                <span className="font-bold text-primary-navy">{selectedBooking.serviceName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Date & Time Slot:</span>
                <span className="font-bold text-primary-navy">{selectedBooking.date} ({selectedBooking.timeSlot})</span>
              </div>
              <div className="col-span-2">
                <span className="text-text-muted block">Assigned Technician:</span>
                <span className="font-bold text-primary-navy">
                  {selectedBooking.technicianName} {selectedBooking.technicianPhone && `(${selectedBooking.technicianPhone})`}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-text-muted block">Service Location:</span>
                <span className="font-medium text-primary-navy">
                  {selectedBooking.address}, {selectedBooking.city} - {selectedBooking.pincode}
                </span>
              </div>
              {selectedBooking.description && (
                <div className="col-span-2">
                  <span className="text-text-muted block">Customer Notes:</span>
                  <span className="italic">{selectedBooking.description}</span>
                </div>
              )}
            </div>

            {/* Status Timeline History */}
            <div>
              <h4 className="font-bold text-primary-navy mb-2 font-heading">
                Status History & Activity
              </h4>
              <div className="space-y-2 border-l-2 border-border-subtle pl-4 ml-1">
                {(selectedBooking.statusHistory || []).map((h, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-secondary-blue ring-4 ring-white" />
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-primary-navy">{h.status}</span>
                      <span className="text-[11px] text-text-muted">{h.time}</span>
                    </div>
                    <p className="text-text-muted text-[11px] mt-0.5">{h.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border-subtle">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg hover:bg-vanilla-dark text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel This Service Booking?"
        message={`Are you sure you want to cancel booking ${bookingToCancel?.id} for ${bookingToCancel?.serviceName}? There is no cancellation fee.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        danger={true}
        isLoading={submittingAction}
      />

      {/* REVIEW SERVICE MODAL */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`Review Service: ${reviewBooking?.serviceName}`}
      >
        {reviewBooking && (
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <p className="text-text-muted">
              How was your service with <strong>{reviewBooking.technicianName}</strong>? Your feedback helps maintain Fixify quality standards.
            </p>

            <div>
              <label className="block font-semibold text-primary-navy mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-accent-orange text-accent-orange'
                          : 'text-border-subtle'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-primary-navy text-sm">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Your Review & Feedback *
              </label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience (e.g. technician arrived on time, clean repair work)..."
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-5 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white font-bold rounded-lg text-xs shadow-xs"
              >
                {submittingAction ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
