import React, { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

export default function TechnicianRequests() {
  const { user } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.bookings.getAll();
      // Show pending requests
      const pending = (data || []).filter((b) => b.status === 'Pending');
      setRequests(pending);
    } catch (err) {
      console.error(err);
      toast.error('Could not load service requests.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Accept Request
  const handleAccept = async (req) => {
    try {
      setActionLoading(true);
      await api.bookings.updateStatus(
        req.id,
        'Confirmed',
        `Accepted by technician ${user?.name || 'Partner'}`
      );
      toast.success(`Request ${req.id} accepted! Added to your My Jobs schedule.`);
      loadRequests();
    } catch (err) {
      toast.error('Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Request
  const handleReject = async (req) => {
    try {
      setActionLoading(true);
      // Remove from this technician's view or reject
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.info(`Request ${req.id} passed to other available local technicians.`);
    } catch (err) {
      toast.error('Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          New Service Requests ({requests.length})
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review incoming doorstep service requests from customers in your operating radius
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center max-w-md mx-auto">
          <Inbox className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-primary-navy">No Pending Requests</h3>
          <p className="text-xs text-text-muted mt-1">
            You are all caught up! New customer repair requests will appear here as soon as they are submitted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-border-subtle p-6 shadow-xs flex flex-col justify-between hover:border-secondary-blue/40 transition-all space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono font-bold text-primary-navy bg-vanilla px-2 py-0.5 rounded border border-border-subtle">
                    {req.id}
                  </span>
                  <span className="text-sm font-extrabold text-primary-navy">
                    ₹{req.estimatedPrice}
                  </span>
                </div>

                <h3 className="text-base font-bold text-primary-navy font-heading">
                  {req.serviceName}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-secondary-blue flex-shrink-0" />
                    <span>Customer: <strong className="text-primary-navy">{req.customerName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-secondary-blue flex-shrink-0" />
                    <span>Date & Slot: <strong>{req.date} ({req.timeSlot})</strong></span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-accent-orange flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">Address: {req.address}, {req.city} - {req.pincode}</span>
                  </div>
                </div>

                {req.description && (
                  <div className="mt-3 p-2.5 rounded-lg bg-vanilla/60 border border-border-subtle text-xs text-text-main italic">
                    "{req.description}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReq(req);
                    setIsDetailsOpen(true);
                  }}
                  className="px-3 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleReject(req)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAccept(req)}
                    className="px-4 py-1.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Request</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Request Details: ${selectedReq?.id}`}
      >
        {selectedReq && (
          <div className="space-y-4 text-xs text-text-main">
            <div className="p-3 bg-vanilla/60 rounded-lg border border-border-subtle flex justify-between items-center">
              <div>
                <p className="font-bold text-primary-navy">{selectedReq.serviceName}</p>
                <p className="text-[11px] text-text-muted">Ref: {selectedReq.id}</p>
              </div>
              <span className="text-base font-extrabold text-primary-navy">
                ₹{selectedReq.estimatedPrice}
              </span>
            </div>

            <div className="space-y-2">
              <p>Customer: <strong>{selectedReq.customerName}</strong></p>
              <p>Phone: <strong>{selectedReq.customerPhone}</strong></p>
              <p>Service Date: <strong>{selectedReq.date} ({selectedReq.timeSlot})</strong></p>
              <p>Full Destination: <strong>{selectedReq.address}, {selectedReq.city} - {selectedReq.pincode}</strong></p>
              {selectedReq.description && (
                <p className="italic bg-white p-2 rounded border border-border-subtle">
                  Notes: {selectedReq.description}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleAccept(selectedReq);
                }}
                className="px-5 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white font-bold rounded-lg shadow-xs"
              >
                Accept This Job
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
