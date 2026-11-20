import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Mumbai',
    pincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { signupCustomer } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await signupCustomer(formData);
      toast.success('Account created successfully! Welcome to Fixify.');
      navigate('/customer/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
      toast.error('Signup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-vanilla flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center text-white shadow-xs">
            <Wrench className="w-5 h-5 text-accent-orange" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary-navy font-heading">
            FIXIFY<span className="w-2 h-2 rounded-full bg-accent-orange ml-1 inline-block"></span>
          </span>
        </Link>

        <h2 className="text-center text-2xl font-bold text-primary-navy font-heading">
          Create Your Customer Account
        </h2>
        <p className="mt-1 text-center text-xs text-text-muted">
          Book verified home technicians with doorstep guarantees
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-border-subtle shadow-md">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primary-navy mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="priya@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98200 12345"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-navy mb-1">
                Full Residential Address *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat / Building number, Street, Landmark..."
                className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="E.g. 400001"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-text-muted">
            Already have a Fixify customer account?{' '}
            <Link to="/login" className="font-semibold text-secondary-blue hover:text-primary-navy">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
