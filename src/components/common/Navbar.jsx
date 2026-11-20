import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/');
    setProfileDropdown(false);
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'customer') return '/customer/dashboard';
    if (user.role === 'technician') return '/technician/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-subtle">
      {/* Top micro-bar for local service trust signal */}
      <div className="bg-primary-navy text-white/90 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-orange" />
              Fixify Guarantee: Verified Local Technicians & Transparent Pricing
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <span>Helpline: <strong className="text-white">1800-200-4545</strong> (9 AM - 8 PM)</span>
            <span className="text-white/40">|</span>
            <Link to="/technician/register" className="hover:text-accent-orange transition-colors">
              Join as a Professional
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/admin/login" className="hover:text-accent-orange transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center text-white shadow-xs group-hover:bg-secondary-blue transition-colors">
              <Wrench className="w-5 h-5 text-accent-orange group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-primary-navy font-heading flex items-center">
                FIXIFY<span className="w-2 h-2 rounded-full bg-accent-orange ml-1 inline-block"></span>
              </span>
              <p className="text-[10px] tracking-wider uppercase text-text-muted font-medium -mt-1 hidden sm:block">
                Trusted Local Home Services
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary-navy ${
                    isActive
                      ? 'text-primary-navy font-semibold border-b-2 border-accent-orange pb-0.5'
                      : 'text-text-muted'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth & CTA Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-vanilla/60 hover:bg-vanilla text-primary-navy transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-navy text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary-navy/10 font-semibold text-primary-navy capitalize">
                    {user.role}
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border-subtle shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-border-subtle">
                      <p className="text-xs text-text-muted">Signed in as</p>
                      <p className="text-sm font-semibold text-primary-navy truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-vanilla transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-secondary-blue" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                    </Link>

                    {user.role === 'customer' && (
                      <Link
                        to="/customer/bookings"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-vanilla transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-secondary-blue" />
                        My Bookings
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-border-subtle mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-navy hover:text-secondary-blue transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-accent-orange hover:bg-accent-orange-hover rounded-lg shadow-xs transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-primary-navy hover:bg-vanilla transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border-subtle space-y-3">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-vanilla text-primary-navy font-semibold'
                      : 'text-text-muted hover:text-primary-navy hover:bg-vanilla/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 bg-vanilla/60 rounded-lg">
                    <p className="text-xs text-text-muted">Signed in as</p>
                    <p className="text-sm font-semibold text-primary-navy">{user.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-navy text-white capitalize inline-block mt-1">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-navy hover:bg-vanilla rounded-lg"
                  >
                    <LayoutDashboard className="w-4 h-4 text-accent-orange" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-primary-navy bg-vanilla rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-accent-orange rounded-lg"
                  >
                    Get Started
                  </Link>
                  <div className="flex justify-between items-center px-2 pt-2 text-xs text-text-muted">
                    <Link to="/technician/login" onClick={() => setIsOpen(false)} className="hover:text-primary-navy">
                      Technician Portal
                    </Link>
                    <Link to="/admin/login" onClick={() => setIsOpen(false)} className="hover:text-primary-navy">
                      Admin Access
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
