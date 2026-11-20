import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  FileText,
  Star,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';

export default function AdminTechnicians() {
  const toast = useToast();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTech, setSelectedTech] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadTechs();
  }, []);

  async function loadTechs() {
    try {
      setLoading(true);
      const data = await api.technicians.getAll();
      setTechnicians(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load technicians.');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (techId, newStatus) => {
    try {
      await api.technicians.updateStatus(techId, newStatus);
      toast.success(`Technician status updated to ${newStatus}.`);
      loadTechs();
      if (selectedTech && selectedTech.id === techId) {
        setSelectedTech({ ...selectedTech, status: newStatus, verified: newStatus === 'Verified' });
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const filtered = technicians.filter((t) => {
    const matchesFilter =
      statusFilter === 'All' ||
      (statusFilter === 'Verified' && (t.status === 'Verified' || t.verified)) ||
      (statusFilter === 'Pending' && (t.status === 'Pending Verification' || !t.verified)) ||
      t.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Technician Management & Verification
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Review partner applications, verify government ID documents, and manage trade licenses
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technician, trade or city..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Verified', 'Pending', 'Rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === f
                ? 'bg-primary-navy text-white shadow-xs'
                : 'bg-white text-text-muted border border-border-subtle hover:text-primary-navy'
            }`}
          >
            {f === 'Pending' ? 'Pending Verification' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading technician roster...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center text-xs text-text-muted">
          No technicians matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tech) => (
            <div
              key={tech.id}
              className="bg-white rounded-2xl border border-border-subtle p-5 shadow-xs hover:border-secondary-blue/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.photo}
                      alt={tech.name}
                      className="w-12 h-12 rounded-full object-cover border border-border-subtle flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-primary-navy font-heading">{tech.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{tech.category}</p>
                    </div>
                  </div>
                  <Badge status={tech.status}>{tech.status}</Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-secondary-blue flex-shrink-0" />
                    <span>Operating in <strong>{tech.city}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-accent-orange text-accent-orange flex-shrink-0" />
                    <span>Rating: <strong>{tech.rating}</strong> ({tech.jobsCompleted || 0} completed)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-secondary-blue flex-shrink-0" />
                    <span className="truncate">Skills: {tech.skills}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTech(tech);
                    setIsDetailsOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {tech.status !== 'Verified' && (
                    <button
                      onClick={() => handleUpdateStatus(tech.id, 'Verified')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {tech.status !== 'Rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(tech.id, 'Rejected')}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Technician Profile Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Technician Profile: ${selectedTech?.name}`}
      >
        {selectedTech && (
          <div className="space-y-4 text-xs text-text-main">
            <div className="flex items-center gap-3.5 p-3.5 bg-vanilla/60 rounded-xl border border-border-subtle">
              <img
                src={selectedTech.photo}
                alt={selectedTech.name}
                className="w-14 h-14 rounded-full object-cover border border-border-subtle"
              />
              <div>
                <h3 className="text-base font-bold text-primary-navy font-heading">{selectedTech.name}</h3>
                <p className="text-xs text-text-muted">{selectedTech.email} &bull; {selectedTech.phone}</p>
                <div className="mt-1">
                  <Badge status={selectedTech.status}>{selectedTech.status}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p>Category: <strong>{selectedTech.category}</strong></p>
              <p>Experience: <strong>{selectedTech.experience}</strong></p>
              <p>City: <strong>{selectedTech.city}</strong></p>
              <p>Address: <strong>{selectedTech.address || 'Workshop location in ' + selectedTech.city}</strong></p>
              <p>Skills & Expertise: <strong>{selectedTech.skills}</strong></p>
              {selectedTech.bio && (
                <p className="italic bg-white p-2.5 rounded-lg border border-border-subtle">
                  Bio: "{selectedTech.bio}"
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-700" />
              <span>Government Identity Verification Documents Uploaded (Aadhaar / Trade ID)</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg text-xs"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedTech.id, 'Rejected')}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-semibold"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTech.id, 'Verified')}
                  className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold"
                >
                  Verify & Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
