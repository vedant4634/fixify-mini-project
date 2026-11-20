import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  LogOut,
  Wrench,
  Menu,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function TechnicianLayout() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Technician signed out.');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/technician/dashboard', icon: LayoutDashboard },
    { name: 'New Requests', path: '/technician/requests', icon: Inbox },
    { name: 'My Jobs', path: '/technician/jobs', icon: Briefcase },
    { name: 'Completed Jobs', path: '/technician/jobs?status=completed', icon: CheckCircle2 },
    { name: 'Availability', path: '/technician/availability', icon: Calendar },
    { name: 'Earnings', path: '/technician/earnings', icon: DollarSign },
    { name: 'Profile', path: '/technician/profile', icon: User },
  ];

  const isVerified = user?.verified || user?.status === 'Verified';

  return (
    <div className="min-h-screen bg-vanilla flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary-navy text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-orange text-primary-navy flex items-center justify-center font-bold">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight font-heading">
            FIXIFY PRO<span className="w-1.5 h-1.5 rounded-full bg-accent-orange ml-0.5 inline-block"></span>
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

      {/* Technician Sidebar */}
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
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-heading flex items-center">
                  FIXIFY PRO<span className="w-1.5 h-1.5 rounded-full bg-accent-orange ml-1 inline-block"></span>
                </span>
                <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium -mt-1">
                  Partner Portal
                </p>
              </div>
            </Link>
          </div>

          {/* Technician Status Card */}
          <div className="p-4 mx-3 my-4 bg-white/10 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-orange text-primary-navy flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'T'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Technician'}
                </p>
                <p className="text-[11px] text-white/70 truncate">
                  {user?.category || 'Plumbing'} &bull; {user?.city || 'Mumbai'}
                </p>
              </div>
            </div>

            {/* Verification status badge */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-white/60">Verification:</span>
              {isVerified ? (
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Pro
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Pending Review
                </span>
              )}
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname + location.search === item.path;
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
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

      {/* Main Technician Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
