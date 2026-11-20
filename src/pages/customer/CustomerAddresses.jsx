import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

export default function CustomerAddresses() {
  const { user } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      tag: 'Home',
      line: 'Flat 402, Sea Green Apts, Juhu Tara Road',
      city: 'Mumbai',
      pincode: '400049',
      isDefault: true,
    },
    {
      id: 'addr-2',
      tag: 'Office',
      line: 'Floor 3, Tech Hub, Bandra Kurla Complex',
      city: 'Mumbai',
      pincode: '400051',
      isDefault: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTag, setNewTag] = useState('Home');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('Mumbai');
  const [newPincode, setNewPincode] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLine || !newPincode) {
      toast.error('Please enter all address details.');
      return;
    }
    const newAddr = {
      id: `addr-${Date.now()}`,
      tag: newTag,
      line: newLine,
      city: newCity,
      pincode: newPincode,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, newAddr]);
    setIsModalOpen(false);
    setNewLine('');
    setNewPincode('');
    toast.success('New address added.');
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.info('Address removed.');
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success('Default address updated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            My Saved Addresses
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your service locations for fast one-click bookings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4 text-accent-orange" />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
              addr.isDefault
                ? 'border-secondary-blue ring-1 ring-secondary-blue/30 shadow-xs'
                : 'border-border-subtle shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-navy px-2 py-0.5 rounded bg-vanilla border border-border-subtle">
                  {addr.tag}
                </span>
                {addr.isDefault && (
                  <span className="text-[11px] font-semibold text-secondary-blue flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2.5 mt-3 text-xs text-text-main">
                <MapPin className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-primary-navy">{addr.line}</p>
                  <p className="text-text-muted mt-0.5">{addr.city} - {addr.pincode}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-semibold text-secondary-blue hover:text-primary-navy"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-[11px] text-text-muted">Primary Address</span>
              )}

              <button
                onClick={() => handleDelete(addr.id)}
                className="p-1.5 text-text-muted hover:text-red-600 rounded-md transition-colors"
                title="Delete Address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Service Address"
      >
        <form onSubmit={handleAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Address Label
            </label>
            <select
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Parents House">Parents' House</option>
              <option value="Rental Flat">Rental Flat</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Complete Address *
            </label>
            <textarea
              required
              rows={2}
              value={newLine}
              onChange={(e) => setNewLine(e.target.value)}
              placeholder="Flat / Floor, Society, Street..."
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                City *
              </label>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                placeholder="400001"
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white font-bold rounded-lg shadow-xs"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
