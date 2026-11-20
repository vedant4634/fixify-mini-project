import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wrench,
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';

export default function AdminDashboard() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [c, t, b, s] = await Promise.all([
        api.customers.getAll(),
        api.technicians.getAll(),
        api.bookings.getAll(),
        api.services.getAll(),
      ]);
      setCustomers(c || []);
      setTechnicians(t || []);
      setBookings(b || []);
      setServices(s || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Fast verify technician handler
  const handleVerifyTech = async (techId, newStatus) => {
    try {
      await api.technicians.updateStatus(techId, newStatus);
      toast.success(`Technician status updated to: ${newStatus}`);
      loadAll();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const totalCustomers = customers.length;
  const totalTechnicians = technicians.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;

  const totalRevenue = bookings
    .filter((b) => b.status === 'Completed')
    .reduce((acc, curr) => acc + (Number(curr.estimatedPrice) || 350), 0);

  // Recent technicians
  const pendingTechs = technicians.filter((t) => !t.verified || t.status === 'Pending Verification');

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-accent-orange uppercase tracking-wider font-heading">
            Super Administrator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading mt-1">
            Operations & Platform Overview
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Live metrics, pending technician approvals, and real-time service activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/technicians"
            className="px-4 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            Review Technicians ({pendingTechs.length})
          </Link>
          <Link
            to="/admin/services"
            className="px-4 py-2 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors"
          >
            Manage Services
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Total Customers</span>
          <span className="text-2xl font-extrabold text-primary-navy font-heading mt-1 block">
            {totalCustomers}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Registered users</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Total Technicians</span>
          <span className="text-2xl font-extrabold text-primary-navy font-heading mt-1 block">
            {totalTechnicians}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Active partners</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Total Bookings</span>
          <span className="text-2xl font-extrabold text-primary-navy font-heading mt-1 block">
            {totalBookings}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">All-time volume</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Pending Bookings</span>
          <span className="text-2xl font-extrabold text-amber-600 font-heading mt-1 block">
            {pendingBookings}
          </span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Needs dispatch</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Completed Bookings</span>
          <span className="text-2xl font-extrabold text-green-700 font-heading mt-1 block">
            {completedBookings}
          </span>
          <span className="text-[11px] text-green-700 font-medium mt-1 block">Signed off</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs bg-gradient-to-br from-white to-vanilla/40">
          <span className="text-xs font-bold text-primary-navy block">Platform Revenue</span>
          <span className="text-2xl font-extrabold text-primary-navy font-heading mt-1 block">
            ₹{totalRevenue}
          </span>
          <span className="text-[10px] text-text-muted mt-1 block">From completed visits</span>
        </div>
      </div>

      {/* Two Column Section: Recent Bookings & Pending Technician Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Bookings Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border-subtle flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-primary-navy font-heading">
                Recent Customer Bookings
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Real-time booking dispatch overview
              </p>
            </div>

            <Link
              to="/admin/bookings"
              className="text-xs font-semibold text-secondary-blue hover:text-primary-navy flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border-subtle overflow-x-auto">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary-navy bg-vanilla px-1.5 py-0.5 rounded border border-border-subtle">
                      {b.id}
                    </span>
                    <strong className="text-primary-navy">{b.serviceName}</strong>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                  <p className="text-text-muted mt-1">
                    Customer: {b.customerName} &bull; Pro: {b.technicianName}
                  </p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="font-bold text-primary-navy block">₹{b.estimatedPrice}</span>
                  <span className="text-[11px] text-text-muted">{b.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pending Technician Registrations */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border-subtle flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-primary-navy font-heading">
                Technician Applications
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Identity and Aadhaar verification approvals
              </p>
            </div>

            <Link
              to="/admin/technicians"
              className="text-xs font-semibold text-secondary-blue hover:text-primary-navy flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {technicians.slice(0, 4).map((tech) => (
              <div
                key={tech.id}
                className="p-3.5 rounded-xl bg-vanilla/50 border border-border-subtle flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tech.photo}
                    alt={tech.name}
                    className="w-10 h-10 rounded-full object-cover border border-border-subtle flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-primary-navy">{tech.name}</p>
                      <Badge status={tech.status}>{tech.status}</Badge>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {tech.category} &bull; {tech.city} ({tech.experience})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!tech.verified ? (
                    <button
                      onClick={() => handleVerifyTech(tech.id, 'Verified')}
                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-[11px]"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Category Statistics */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs p-6">
        <h3 className="text-base font-bold text-primary-navy font-heading mb-4">
          Service Category Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {services.map((s) => {
            const count = bookings.filter((b) => b.serviceName?.toLowerCase() === s.name.toLowerCase()).length;
            return (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-vanilla/40 border border-border-subtle text-xs"
              >
                <span className="font-bold text-primary-navy block truncate">{s.name}</span>
                <span className="text-lg font-extrabold text-primary-navy block mt-1">
                  {count} bookings
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  Base rate: ₹{s.startingPrice}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
