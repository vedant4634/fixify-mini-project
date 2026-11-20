import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    toast.success('Password reset link sent to your email.');
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

        <h2 className="text-center text-2xl font-bold text-primary-navy font-heading">
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-xs text-text-muted">
          Enter your registered email and we'll send a recovery link
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-border-subtle shadow-md">
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary-navy">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                If an account exists with <strong>{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-blue hover:text-primary-navy"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-text-muted hover:text-primary-navy inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
