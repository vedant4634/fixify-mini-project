import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Navigation,
  Wrench,
  Check,
  Star,
  Compass,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import MapPicker from '../../components/common/MapPicker';

export default function TechnicianJobs() {
  const [searchParams] = useSearchParams();
  const filterStatusParam = searchParams.get('status');

  const { user } = useAuth();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(filterStatusParam === 'completed' ? 'Completed' : 'Active');
  const [selectedJobMap, setSelectedJobMap] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await api.bookings.getAll();
      setJobs(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load jobs.');
    } finally {
      setLoading(false);
    }
  }

  // Update status action
  const handleUpdateStatus = async (jobId, newStatus, note) => {
    try {
      setUpdatingId(jobId);
      await api.bookings.updateStatus(jobId, newStatus, note);
      toast.success(`Job ${jobId} updated to: ${newStatus}`);
      loadJobs();
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === 'Completed') {
      return j.status === 'Completed';
    }
    // Active jobs: Confirmed, Technician Assigned, On the Way, In Progress
    return (
      j.status === 'Confirmed' ||
      j.status === 'Technician Assigned' ||
      j.status === 'On the Way' ||
      j.status === 'In Progress'
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Technician Job Manager
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Update job progression from travel dispatch to completed doorstep signoff
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-border-subtle shadow-xs">
          <button
            onClick={() => setActiveTab('Active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'Active'
                ? 'bg-primary-navy text-white'
                : 'text-text-muted hover:text-primary-navy'
            }`}
          >
            Active Jobs ({jobs.filter((j) => j.status !== 'Completed' && j.status !== 'Cancelled' && j.status !== 'Pending').length})
          </button>
          <button
            onClick={() => setActiveTab('Completed')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'Completed'
                ? 'bg-primary-navy text-white'
                : 'text-text-muted hover:text-primary-navy'
            }`}
          >
            Completed History ({jobs.filter((j) => j.status === 'Completed').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading assigned jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-primary-navy">No {activeTab} Jobs</h3>
          <p className="text-xs text-text-muted mt-1">
            {activeTab === 'Active'
              ? 'Check the New Requests tab to accept upcoming assignments.'
              : 'Completed jobs and customer ratings will show up here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const isUpdating = updatingId === job.id;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-border-subtle p-6 shadow-xs hover:border-secondary-blue/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Job Specs */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold font-mono text-primary-navy bg-vanilla px-2 py-0.5 rounded border border-border-subtle">
                      {job.id}
                    </span>
                    <h3 className="text-base font-bold text-primary-navy font-heading">
                      {job.serviceName}
                    </h3>
                    <Badge status={job.status}>{job.status}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-muted pt-1">
                    <div>
                      Customer: <strong className="text-primary-navy">{job.customerName}</strong>
                      {job.customerPhone && (
                        <a
                          href={`tel:${job.customerPhone}`}
                          className="ml-2 inline-flex items-center gap-1 text-secondary-blue hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{job.customerPhone}</span>
                        </a>
                      )}
                    </div>
                    <div>
                      Slot: <strong className="text-primary-navy">{job.date} ({job.timeSlot})</strong>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent-orange flex-shrink-0 mt-0.5" />
                      <span>{job.address}, {job.city} - {job.pincode}</span>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-xs text-text-muted bg-vanilla/50 p-2 rounded-lg italic">
                      Customer Note: "{job.description}"
                    </p>
                  )}
                </div>

                {/* Status Transitions & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-text-muted uppercase block">Estimated Fee</span>
                    <span className="text-lg font-extrabold text-primary-navy">₹{job.estimatedPrice}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Address on Map */}
                    <button
                      type="button"
                      onClick={() => setSelectedJobMap(job)}
                      className="px-3 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle flex items-center gap-1 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-accent-orange" />
                      <span>Map Pin</span>
                    </button>

                    {/* Step-by-Step Status Progression Buttons */}
                    {(job.status === 'Confirmed' || job.status === 'Technician Assigned' || job.status === 'Accepted') && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(job.id, 'On the Way', 'Technician started journey to customer premises')
                        }
                        className="px-3.5 py-1.5 bg-secondary-blue hover:bg-primary-navy text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Mark: On the Way</span>
                      </button>
                    )}

                    {job.status === 'On the Way' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(job.id, 'In Progress', 'Technician arrived at doorstep and commenced repair')
                        }
                        className="px-3.5 py-1.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Mark: Work Started</span>
                      </button>
                    )}

                    {job.status === 'In Progress' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(job.id, 'Completed', 'Repair completed, tested and signed off by customer')
                        }
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark: Completed</span>
                      </button>
                    )}

                    {job.status === 'Completed' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Map Modal */}
      <Modal
        isOpen={!!selectedJobMap}
        onClose={() => setSelectedJobMap(null)}
        title={`Service Location: ${selectedJobMap?.customerName}`}
        maxWidth="max-w-xl"
      >
        {selectedJobMap && (
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Destination for <strong>{selectedJobMap.serviceName}</strong> (Ref: {selectedJobMap.id})
            </p>

            <MapPicker
              lat={selectedJobMap.lat || 19.1025}
              lng={selectedJobMap.lng || 72.8271}
              readOnly={true}
              height="280px"
              popupText={`${selectedJobMap.customerName} - ${selectedJobMap.address}`}
            />

            <div className="p-3 rounded-lg bg-vanilla/60 border border-border-subtle flex items-start gap-2">
              <MapPin className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary-navy">{selectedJobMap.address}</p>
                <p className="text-text-muted">{selectedJobMap.city} - {selectedJobMap.pincode}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJobMap(null)}
                className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg text-xs"
              >
                Close Map
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
