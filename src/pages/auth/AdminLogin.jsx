import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight, Lock, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setSubmitting(true);
      await loginAdmin(email.trim(), password);
      toast.success('Admin authorization verified.');
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authorization failed.');
      toast.error('Admin authentication rejected.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@fixify.in');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-vanilla flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center text-white shadow-xs">
            <Wrench className="w-5 h-5 text-accent-orange" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary-navy font-heading">
            FIXIFY<span className="w-2 h-2 rounded-full bg-accent-orange ml-1 inline-block"></span>
          </span>
        </Link>

        <div className="inline-block mx-auto bg-primary-navy text-accent-orange text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Administrator Console
        </div>
        <h2 className="text-center text-2xl font-bold text-primary-navy font-heading">
          System Administration
        </h2>
        <p className="mt-1 text-center text-xs text-text-muted">
          Platform supervision, technician verification, and operations management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-border-subtle shadow-md">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primary-navy mb-1">
                Admin Username / Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fixify.in"
                className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-navy mb-1">
                Security Password
              </label>
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
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{submitting ? 'Verifying Authorization...' : 'Access Admin Dashboard'}</span>
              <ShieldCheck className="w-4 h-4 text-accent-orange" />
            </button>
          </form>

          {/* Demo fill */}
          <div className="mt-6 pt-5 border-t border-border-subtle">
            <div className="p-3 rounded-lg bg-vanilla/70 border border-border-subtle">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-primary-navy uppercase">
                  Faculty / Admin Demo
                </span>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-[11px] font-semibold text-accent-orange hover:underline"
                >
                  Auto-fill Admin &rarr;
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                Demo user: <strong>admin@fixify.in</strong> / <strong>admin123</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-text-muted">
          <Link to="/" className="hover:text-primary-navy">
            &larr; Return to Fixify Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
