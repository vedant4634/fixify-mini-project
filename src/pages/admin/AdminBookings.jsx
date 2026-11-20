import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      await api.bookings.updateStatus(
        selectedBooking.id,
        newStatus,
        statusNote || `Status updated to ${newStatus} by Admin`
      );
      toast.success(`Booking ${selectedBooking.id} status changed to ${newStatus}.`);
      setIsStatusModalOpen(false);
      loadBookings();
    } catch (err) {
      toast.error('Failed to update booking status.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    'All',
    'Pending',
    'Confirmed',
    'Technician Assigned',
    'On the Way',
    'In Progress',
    'Completed',
    'Cancelled',
  ];

  const filtered = bookings.filter((b) => {
    const matchesFilter =
      statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.technicianName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Booking Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track all doorstep repair appointments, assigned personnel, and override status
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ID, customer or technician..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setStatusFilter(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === opt
                ? 'bg-primary-navy text-white shadow-xs'
                : 'bg-white text-text-muted border border-border-subtle hover:text-primary-navy'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center text-xs text-text-muted">
          No bookings matching your criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-main">
              <thead className="bg-vanilla/60 border-b border-border-subtle text-[11px] uppercase font-bold text-primary-navy tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-vanilla/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-navy">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary-navy">
                      {b.serviceName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-primary-navy">{b.customerName}</div>
                      <div className="text-[11px] text-text-muted">{b.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-primary-navy">{b.technicianName}</div>
                      <div className="text-[11px] text-text-muted">{b.city}</div>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      <div>{b.date}</div>
                      <div className="text-[11px]">{b.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary-navy">
                      ₹{b.estimatedPrice}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={b.status}>{b.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setIsDetailsOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-vanilla hover:bg-vanilla-dark text-primary-navy rounded border border-border-subtle"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setNewStatus(b.status);
                            setStatusNote('');
                            setIsStatusModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-primary-navy hover:bg-secondary-blue text-white rounded"
                          title="Update Status"
                        >
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Booking Record: ${selectedBooking?.id}`}
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs text-text-main">
            <div className="p-3 bg-vanilla/60 rounded-lg border border-border-subtle flex justify-between items-center">
              <div>
                <p className="font-bold text-primary-navy">{selectedBooking.serviceName}</p>
                <p className="text-[11px] text-text-muted">ID: {selectedBooking.id}</p>
              </div>
              <Badge status={selectedBooking.status}>{selectedBooking.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-border-subtle">
              <div>
                <span className="text-text-muted block">Customer Name:</span>
                <span className="font-bold text-primary-navy">{selectedBooking.customerName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Phone:</span>
                <span className="font-bold text-primary-navy">{selectedBooking.customerPhone}</span>
              </div>
              <div>
                <span className="text-text-muted block">Technician:</span>
                <span className="font-bold text-primary-navy">{selectedBooking.technicianName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Date & Slot:</span>
                <span className="font-bold text-primary-navy">{selectedBooking.date} ({selectedBooking.timeSlot})</span>
              </div>
              <div className="col-span-2">
                <span className="text-text-muted block">Address:</span>
                <span>{selectedBooking.address}, {selectedBooking.city} - {selectedBooking.pincode}</span>
              </div>
              {selectedBooking.description && (
                <div className="col-span-2">
                  <span className="text-text-muted block">Notes:</span>
                  <span className="italic">{selectedBooking.description}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status: ${selectedBooking?.id}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Select New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue font-semibold text-primary-navy"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Technician Assigned">Technician Assigned</option>
              <option value="On the Way">On the Way</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Admin Status Note / Reason
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="E.g. Manually verified and scheduled by dispatch desk"
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-primary-navy hover:bg-secondary-blue text-white font-bold rounded-lg text-xs"
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
