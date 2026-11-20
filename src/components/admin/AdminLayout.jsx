import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Layers,
  CalendarCheck,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLayout() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Administrator signed out.');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Technicians', path: '/admin/technicians', icon: Wrench },
    { name: 'Services', path: '/admin/services', icon: Layers },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-vanilla flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-primary-navy text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-orange text-primary-navy flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight font-heading">
            FIXIFY ADMIN
          </span>
        </Link>

        <button
          onClick={() => setMobileSidebar(!mobileSidebar)}
          className="p-2 text-white hover:bg-white/10 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-primary-navy text-white flex flex-col justify-between z-40 transition-transform duration-200 md:translate-x-0 ${
          mobileSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header in Sidebar */}
          <div className="p-6 border-b border-white/10 hidden md:flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-orange text-primary-navy flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-heading flex items-center">
                  FIXIFY ADMIN
                </span>
                <p className="text-[10px] uppercase tracking-wider text-accent-orange font-bold -mt-0.5">
                  Operations Console
                </p>
              </div>
            </Link>
          </div>

          {/* Admin User Badge */}
          <div className="p-4 mx-3 my-4 bg-white/10 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-orange text-primary-navy flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-accent-orange font-semibold uppercase tracking-wider">
                Super Admin Role
              </p>
            </div>
          </div>

          {/* Navigation Items */}
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
                      ? 'bg-accent-orange text-primary-navy font-bold shadow-xs'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:text-white"
          >
            <span>&larr; View Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Main Admin Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
