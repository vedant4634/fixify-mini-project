import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Compass,
  MapPin,
  Star,
  User,
  LogOut,
  Menu,
  X,
  Wrench,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerLayout() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully.');
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Services', path: '/services', icon: Search },
    { name: 'My Bookings', path: '/customer/bookings', icon: Briefcase },
    { name: 'Track Booking', path: '/customer/track', icon: Compass },
    { name: 'My Addresses', path: '/customer/addresses', icon: MapPin },
    { name: 'Reviews', path: '/customer/reviews', icon: Star },
    { name: 'Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-vanilla flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-border-subtle p-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-navy flex items-center justify-center text-white">
            <Wrench className="w-4 h-4 text-accent-orange" />
          </div>
          <span className="text-xl font-bold text-primary-navy font-heading">
            FIXIFY<span className="w-1.5 h-1.5 rounded-full bg-accent-orange ml-0.5 inline-block"></span>
          </span>
        </Link>

        <button
          onClick={() => setMobileSidebar(!mobileSidebar)}
          className="p-2 text-primary-navy hover:bg-vanilla rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-border-subtle flex flex-col justify-between z-40 transition-transform duration-200 md:translate-x-0 ${
          mobileSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo in Sidebar */}
          <div className="p-6 border-b border-border-subtle hidden md:flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-navy flex items-center justify-center text-white shadow-xs">
                <Wrench className="w-5 h-5 text-accent-orange" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-primary-navy font-heading flex items-center">
                  FIXIFY<span className="w-1.5 h-1.5 rounded-full bg-accent-orange ml-1 inline-block"></span>
                </span>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium -mt-1">
                  Customer Portal
                </p>
              </div>
            </Link>
          </div>

          {/* User Mini Profile Card in Sidebar */}
          <div className="p-4 mx-3 my-4 bg-vanilla/70 rounded-xl border border-border-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-navy text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary-navy truncate">
                {user?.name || 'Customer'}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {user?.city || 'Mumbai'} &bull; Customer
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebar(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-navy text-white shadow-xs'
                      : 'text-text-muted hover:text-primary-navy hover:bg-vanilla/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-orange' : 'text-text-muted'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-border-subtle space-y-2">
          <Link
            to="/customer/book-service"
            className="w-full py-2 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Book New Service</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
