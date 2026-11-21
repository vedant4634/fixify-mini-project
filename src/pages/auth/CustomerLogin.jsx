import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerLogin() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/customer/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      await loginCustomer(emailOrPhone.trim(), password, rememberMe);
      toast.success('Welcome back to Fixify!');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      toast.error('Unable to sign in. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill for faculty testing with real MySQL database account
  const fillDemo = () => {
    setEmailOrPhone('aditya.k@fixify.in');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-vanilla flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <Link to="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center text-white shadow-xs">
            <Wrench className="w-5 h-5 text-accent-orange" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary-navy font-heading">
            FIXIFY<span className="w-2 h-2 rounded-full bg-accent-orange ml-1 inline-block"></span>
          </span>
        </Link>

        <h2 className="text-center text-2xl font-bold text-primary-navy font-heading">
          Customer Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-text-muted">
          Manage your bookings and book verified local home services
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-border-subtle shadow-md">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primary-navy mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com or 9820012345"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-primary-navy">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-secondary-blue hover:text-primary-navy"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary-blue border-border-subtle focus:ring-secondary-blue"
                />
                <span className="text-xs text-text-muted">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-border-subtle text-center">
            <div className="p-3 rounded-lg bg-vanilla/70 border border-border-subtle text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-primary-navy uppercase">
                  Faculty / Demo Login
                </span>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-[11px] font-semibold text-accent-orange hover:underline"
                >
                  Auto-fill Demo &rarr;
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                Demo user: <strong>kavita.iyer@gmail.com</strong> / password: <strong>customer123</strong>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-muted">
            Don't have a Fixify customer account?{' '}
            <Link to="/signup" className="font-semibold text-secondary-blue hover:text-primary-navy">
              Sign up here
            </Link>
          </div>
        </div>

        {/* Portals switcher */}
        <div className="mt-6 text-center space-x-4 text-xs text-text-muted">
          <Link to="/technician/login" className="hover:text-primary-navy">
            Technician Login &rarr;
          </Link>
          <span>&bull;</span>
          <Link to="/admin/login" className="hover:text-primary-navy">
            Admin Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
