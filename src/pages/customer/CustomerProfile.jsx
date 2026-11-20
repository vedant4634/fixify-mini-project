import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || 'Kavita Iyer',
    email: user?.email || 'kavita.iyer@gmail.com',
    phone: user?.phone || '+91 98200 12345',
    address: user?.address || 'Flat 402, Sea Green Apts, Juhu Tara Road, Mumbai',
    city: user?.city || 'Mumbai',
    pincode: user?.pincode || '400049',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      updateUser(formData);
      setSavingProfile(false);
      toast.success('Profile details updated successfully.');
    }, 400);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Your security password has been changed.');
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Profile Settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal details, default contact, and security preferences
        </p>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs">
        <h3 className="text-base font-bold text-primary-navy font-heading mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-secondary-blue" />
          <span>Personal Information</span>
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
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
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                City
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
                Pincode
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-primary-navy mb-1">
              Residential Address
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border-subtle">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-accent-orange" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs">
        <h3 className="text-base font-bold text-primary-navy font-heading mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-secondary-blue" />
          <span>Change Security Password</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary-navy mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border-subtle">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
