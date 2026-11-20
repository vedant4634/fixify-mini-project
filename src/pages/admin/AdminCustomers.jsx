import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, MapPin, ShieldCheck, Eye, Ban, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';

export default function AdminCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await api.customers.getAll();
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load customer accounts.');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async (cust) => {
    const newStatus = cust.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.customers.update(cust.id, { status: newStatus });
      toast.success(`Account for ${cust.name} set to ${newStatus}.`);
      loadCustomers();
    } catch (err) {
      toast.error('Failed to update customer status.');
    }
  };

  const filtered = customers.filter(
    (c) =>
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Customer Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            View registered customer profiles, booking volumes, and account status
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone or city..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue shadow-2xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading customer records...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-main">
              <thead className="bg-vanilla/60 border-b border-border-subtle text-[11px] uppercase font-bold text-primary-navy tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Bookings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-vanilla/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary-navy">{cust.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">{cust.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      <div>{cust.email}</div>
                      <div>{cust.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">{cust.city}</td>
                    <td className="py-3.5 px-4 font-semibold text-primary-navy">
                      {cust.bookingsCount || 0} visits
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={cust.status}>{cust.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCust(cust);
                            setIsDetailsOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-vanilla hover:bg-vanilla-dark text-primary-navy rounded border border-border-subtle flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(cust)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                            cust.status === 'Active'
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {cust.status === 'Active' ? 'Suspend' : 'Activate'}
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

      {/* Customer Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Customer Record: ${selectedCust?.name}`}
      >
        {selectedCust && (
          <div className="space-y-4 text-xs text-text-main">
            <div className="p-3 bg-vanilla/60 rounded-lg border border-border-subtle flex justify-between items-center">
              <div>
                <p className="font-bold text-primary-navy">{selectedCust.name}</p>
                <p className="text-[11px] text-text-muted">{selectedCust.email}</p>
              </div>
              <Badge status={selectedCust.status}>{selectedCust.status}</Badge>
            </div>

            <div className="space-y-2">
              <p>Phone Number: <strong>{selectedCust.phone}</strong></p>
              <p>Operating City: <strong>{selectedCust.city}</strong></p>
              <p>Primary Address: <strong>{selectedCust.address}</strong></p>
              <p>Pincode: <strong>{selectedCust.pincode}</strong></p>
              <p>Total Bookings Created: <strong>{selectedCust.bookingsCount || 0}</strong></p>
            </div>

            <div className="flex justify-end pt-3 border-t border-border-subtle">
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
    </div>
  );
}
