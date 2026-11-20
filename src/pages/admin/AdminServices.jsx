import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  DollarSign,
  Tag
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function AdminServices() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'Wrench',
    image: '',
    shortDesc: '',
    description: '',
    startingPrice: 299,
    priceUnit: 'onwards',
    popular: false,
    included: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await api.services.getAll();
      setServices(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load services.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'Wrench',
      image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
      shortDesc: '',
      description: '',
      startingPrice: 299,
      priceUnit: 'onwards',
      popular: false,
      included: 'Inspection and diagnostic check\nStandard repair labor\n30-day Fixify guarantee',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (serv) => {
    setEditingService(serv);
    setFormData({
      name: serv.name,
      slug: serv.slug || serv.id,
      icon: serv.icon || 'Wrench',
      image: serv.image || '',
      shortDesc: serv.shortDesc || '',
      description: serv.description || '',
      startingPrice: serv.startingPrice || 299,
      priceUnit: serv.priceUnit || 'onwards',
      popular: !!serv.popular,
      included: (serv.included || []).join('\n'),
    });
    setIsFormOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        ...formData,
        startingPrice: Number(formData.startingPrice) || 299,
        included: formData.included
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingService) {
        await api.services.update(editingService.id, payload);
        toast.success(`Service "${formData.name}" updated successfully.`);
      } else {
        await api.services.create(payload);
        toast.success(`New service "${formData.name}" added to catalog.`);
      }
      setIsFormOpen(false);
      loadServices();
    } catch (err) {
      toast.error('Failed to save service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setActionLoading(true);
      await api.services.delete(serviceToDelete.id);
      toast.success(`Service "${serviceToDelete.name}" removed.`);
      setIsDeleteOpen(false);
      setServiceToDelete(null);
      loadServices();
    } catch (err) {
      toast.error('Failed to delete service.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = services.filter(
    (s) =>
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Service Catalog & Pricing
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage service categories, descriptions, inclusions, and standard rates
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((serv) => (
            <div
              key={serv.id}
              className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 overflow-hidden bg-vanilla-dark">
                  <img
                    src={serv.image}
                    alt={serv.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-primary-navy text-white text-xs px-2.5 py-1 rounded-md font-bold shadow-xs">
                    ₹{serv.startingPrice} {serv.priceUnit}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-primary-navy font-heading">
                      {serv.name}
                    </h3>
                    {serv.popular && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-accent-orange text-white font-bold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2">
                    {serv.shortDesc || serv.description}
                  </p>

                  <div className="mt-3 text-[11px] text-text-muted">
                    <span>Includes {serv.included?.length || 0} standard checklist points</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 mt-2">
                <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(serv)}
                    className="px-3 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setServiceToDelete(serv);
                      setIsDeleteOpen(true);
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingService ? `Edit Service: ${editingService.name}` : 'Add New Service'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveService} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g. Waterproofing"
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Slug / URL Identifier
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="waterproofing"
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Estimated Starting Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Price Unit
              </label>
              <input
                type="text"
                value={formData.priceUnit}
                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                placeholder="onwards / per unit"
                className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Service Image URL
            </label>
            <input
              type="url"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Short Summary
            </label>
            <input
              type="text"
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              placeholder="Short 1-line description for service cards..."
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed explanation of what this service covers..."
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              What's Included (1 per line)
            </label>
            <textarea
              rows={3}
              value={formData.included}
              onChange={(e) => setFormData({ ...formData, included: e.target.value })}
              placeholder="Full inspection\nRepairs with genuine parts\n30-day warranty"
              className="w-full px-3 py-2 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue font-mono text-[11px]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.popular}
              onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              className="w-4 h-4 rounded text-secondary-blue"
            />
            <span className="font-semibold text-primary-navy">Mark as Popular Service on Homepage</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-vanilla text-primary-navy font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white font-bold rounded-lg text-xs shadow-xs"
            >
              {actionLoading ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete Service: ${serviceToDelete?.name}?`}
        message="Are you sure you want to remove this service from the Fixify catalog? Customers will no longer be able to book this category."
        confirmText="Yes, Delete Service"
        danger={true}
        isLoading={actionLoading}
      />
    </div>
  );
}
