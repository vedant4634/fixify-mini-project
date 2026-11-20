import React, { useState } from 'react';
import { User, Phone, MapPin, Wrench, ShieldCheck, Save, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function TechnicianProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || 'Rajesh Kumar',
    email: user?.email || 'rajesh.plumbing@fixify.in',
    phone: user?.phone || '+91 98201 44521',
    city: user?.city || 'Mumbai',
    category: user?.category || 'Plumbing',
    skills: user?.skills || 'Pipe fittings, sanitary ware, pressure pumps',
    experience: user?.experience || '8 years',
    hourlyRate: user?.hourlyRate || 350,
    bio: user?.bio || 'Licensed master plumber with over 8 years of experience servicing residential complexes.',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser(formData);
      setSaving(false);
      toast.success('Technician profile updated successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Technician Profile
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Update your public profile, skills, and pricing seen by homeowners
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Header Card info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-vanilla/60 border border-border-subtle">
            <div className="w-16 h-16 rounded-full bg-primary-navy text-accent-orange flex items-center justify-center font-bold text-xl shadow-xs">
              {formData.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-primary-navy font-heading">{formData.name}</h3>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold">
                  {user?.status || 'Verified'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {formData.category} Specialist &bull; {formData.city}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Trade Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical Repairs">Electrical Repairs</option>
                <option value="AC Repair & Maintenance">AC Repair & Maintenance</option>
                <option value="Home Cleaning">Home Cleaning</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Appliance Repair">Appliance Repair</option>
                <option value="Home Maintenance">Home Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Operating City
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
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
                Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="E.g. 8 years"
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Skills & Expertise (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Professional Biography
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border-subtle">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-accent-orange" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
