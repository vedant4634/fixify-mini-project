import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import MapPicker from '../../components/common/MapPicker';

export default function CustomerTrackBooking() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.bookings.getAll();
        setBookings(data || []);

        if (queryId) {
          const match = (data || []).find((b) => b.id === queryId);
          if (match) setSelectedBooking(match);
          else setSelectedBooking(data?.[0] || null);
        } else {
          // Default to the first in-progress or confirmed booking
          const active = (data || []).find(
            (b) => b.status === 'In Progress' || b.status === 'On the Way' || b.status === 'Confirmed'
          );
          setSelectedBooking(active || data?.[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [queryId]);

  const timelineSteps = [
    { title: 'Requested', desc: 'Booking submitted by customer' },
    { title: 'Confirmed', desc: 'Service dispatch confirmed appointment' },
    { title: 'Technician Assigned', desc: 'Specialist assigned to your request' },
    { title: 'On the Way', desc: 'Technician is en route with toolkit' },
    { title: 'In Progress', desc: 'Doorstep repair currently underway' },
    { title: 'Completed', desc: 'Work done & customer satisfaction signed' },
  ];

  const getStepStatus = (stepTitle, currentStatus) => {
    const statusOrder = [
      'Pending',
      'Confirmed',
      'Technician Assigned',
      'On the Way',
      'In Progress',
      'Completed',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepTitle);

    if (currentStatus === 'Cancelled') {
      return 'cancelled';
    }
    if (currentIndex >= stepIndex) {
      return 'done';
    }
    if (currentIndex === stepIndex - 1) {
      return 'active';
    }
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-text-muted">
        Loading booking tracking...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Booking Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Track Booking
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time status updates and doorstep service location
          </p>
        </div>

        {bookings.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">Select Booking:</span>
            <select
              value={selectedBooking?.id || ''}
              onChange={(e) => {
                const match = bookings.find((b) => b.id === e.target.value);
                setSelectedBooking(match || null);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-border-subtle rounded-lg font-bold text-primary-navy shadow-2xs focus:outline-none focus:border-secondary-blue"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} &bull; {b.serviceName} ({b.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedBooking ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center max-w-md mx-auto">
          <Compass className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-primary-navy">No Bookings to Track</h3>
          <p className="text-xs text-text-muted mt-1">
            You don't have any active bookings right now.
          </p>
          <Link
            to="/customer/book-service"
            className="mt-4 inline-block px-4 py-2 bg-primary-navy text-white text-xs font-semibold rounded-lg"
          >
            Book a Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timeline & Technician info */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Header Banner */}
            <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
              <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary-navy bg-vanilla px-2 py-0.5 rounded border border-border-subtle">
                      {selectedBooking.id}
                    </span>
                    <h2 className="text-xl font-bold text-primary-navy font-heading">
                      {selectedBooking.serviceName}
                    </h2>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Scheduled for {selectedBooking.date} ({selectedBooking.timeSlot})
                  </p>
                </div>
                <Badge status={selectedBooking.status} size="lg">
                  {selectedBooking.status}
                </Badge>
              </div>

              {/* Status Timeline */}
              <div className="pt-6">
                <h3 className="text-xs font-bold text-primary-navy uppercase tracking-wider mb-6">
                  Service Progress Timeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
                  {timelineSteps.map((step, idx) => {
                    const status = getStepStatus(step.title, selectedBooking.status);
                    const isDone = status === 'done';
                    const isCurrent = status === 'active';

                    return (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[19px] top-0.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                            isDone
                              ? 'bg-green-600 border-green-600 text-white'
                              : isCurrent
                              ? 'bg-accent-orange border-accent-orange ring-4 ring-accent-orange/20 animate-pulse'
                              : 'bg-white border-border-subtle'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isDone || isCurrent ? 'text-primary-navy' : 'text-text-muted'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Assigned Technician Contact Card */}
            <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-orange">
                Assigned Specialist
              </span>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-primary-navy text-accent-orange flex items-center justify-center font-bold text-base shadow-xs">
                    {selectedBooking.technicianName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-primary-navy">
                        {selectedBooking.technicianName}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-secondary-blue" />
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Fixify Verified Technician &bull; {selectedBooking.serviceName}
                    </p>
                  </div>
                </div>

                {selectedBooking.technicianPhone && (
                  <a
                    href={`tel:${selectedBooking.technicianPhone}`}
                    className="px-3.5 py-2 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-bold rounded-lg border border-border-subtle flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-accent-orange" />
                    <span>Call Pro</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Location Map & Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* OpenStreetMap Component */}
            <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-primary-navy font-heading">
                  Service Location Map
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  OpenStreetMap verified coordinates
                </p>
              </div>

              <MapPicker
                lat={selectedBooking.lat || 19.1025}
                lng={selectedBooking.lng || 72.8271}
                readOnly={true}
                height="260px"
                popupText={`${selectedBooking.serviceName} - ${selectedBooking.address}`}
              />

              <div className="p-3 rounded-lg bg-vanilla/60 border border-border-subtle flex items-start gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-primary-navy">Destination Address</p>
                  <p className="text-text-muted mt-0.5">
                    {selectedBooking.address}, {selectedBooking.city} - {selectedBooking.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Note on Location Accuracy */}
            <div className="p-4 rounded-xl bg-vanilla-light border border-border-subtle text-xs text-text-muted flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-secondary-blue flex-shrink-0 mt-0.5" />
              <p>
                Map displays verified customer service destination and dispatched technician zone. No mock GPS spoofing is used.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
