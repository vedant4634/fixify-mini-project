import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Inbox,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.bookings.getAll();
        setJobs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalJobs = jobs.length;
  const pendingRequests = jobs.filter((j) => j.status === 'Pending').length;
  const upcomingJobs = jobs.filter(
    (j) => j.status === 'Confirmed' || j.status === 'Technician Assigned' || j.status === 'On the Way' || j.status === 'In Progress'
  ).length;
  const completedJobs = jobs.filter((j) => j.status === 'Completed').length;

  // Calculate earnings based on completed jobs
  const totalEarnings = jobs
    .filter((j) => j.status === 'Completed')
    .reduce((acc, curr) => acc + (Number(curr.estimatedPrice) || 350), 0);

  const activeJob = jobs.find((j) => j.status === 'In Progress' || j.status === 'On the Way');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-orange uppercase tracking-wider font-heading">
            <Wrench className="w-3.5 h-3.5" />
            <span>Technician Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading mt-1">
            Welcome, {user?.name || 'Partner'}!
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Category: <strong>{user?.category || 'General Maintenance'}</strong> &bull; Operating in {user?.city || 'Mumbai'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/technician/requests"
            className="px-4 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            New Requests ({pendingRequests})
          </Link>
          <Link
            to="/technician/jobs"
            className="px-4 py-2 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors"
          >
            My Active Jobs
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Total Jobs</span>
          <span className="text-2xl font-extrabold text-primary-navy font-heading mt-1 block">
            {totalJobs}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Lifetime on platform</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Pending Requests</span>
          <span className="text-2xl font-extrabold text-amber-600 font-heading mt-1 block">
            {pendingRequests}
          </span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Awaiting response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Upcoming Jobs</span>
          <span className="text-2xl font-extrabold text-secondary-blue font-heading mt-1 block">
            {upcomingJobs}
          </span>
          <span className="text-[11px] text-secondary-blue font-medium mt-1 block">Scheduled visits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Completed Jobs</span>
          <span className="text-2xl font-extrabold text-green-700 font-heading mt-1 block">
            {completedJobs}
          </span>
          <span className="text-[11px] text-green-700 font-medium mt-1 block">Customer approved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs bg-gradient-to-br from-white to-vanilla/50">
          <span className="text-xs text-text-muted block">Earnings Summary</span>
          <span className="text-2xl font-extrabold text-primary-navy font-heading mt-1 block">
            ₹{totalEarnings}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Net payout earned</span>
        </div>
      </div>

      {/* Active Job Alert */}
      {activeJob && (
        <div className="bg-white p-6 rounded-2xl border-2 border-accent-orange shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-accent-orange">
                  Immediate Priority Job
                </span>
                <Badge status={activeJob.status}>{activeJob.status}</Badge>
              </div>
              <h3 className="text-base font-bold text-primary-navy">
                {activeJob.serviceName} &bull; Customer: {activeJob.customerName}
              </h3>
              <p className="text-xs text-text-muted">
                Address: <strong>{activeJob.address}, {activeJob.city}</strong> ({activeJob.customerPhone})
              </p>
            </div>

            <Link
              to="/technician/jobs"
              className="px-5 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              Update Job Status &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Jobs Schedule */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-primary-navy font-heading">
              Assigned Job Queue
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Service appointments scheduled in your city
            </p>
          </div>

          <Link
            to="/technician/jobs"
            className="text-xs font-semibold text-secondary-blue hover:text-primary-navy flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading assigned jobs...</div>
        ) : (
          <div className="divide-y divide-border-subtle overflow-x-auto">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-vanilla/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-primary-navy bg-vanilla px-2 py-0.5 rounded border border-border-subtle">
                      {job.id}
                    </span>
                    <h4 className="text-sm font-bold text-primary-navy">{job.serviceName}</h4>
                    <Badge status={job.status}>{job.status}</Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    Customer: <strong>{job.customerName}</strong> ({job.customerPhone})
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Location: {job.address}, {job.city} &bull; Slot: {job.date} ({job.timeSlot})
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase block">Estimated Fee</span>
                    <span className="text-sm font-bold text-primary-navy">₹{job.estimatedPrice}</span>
                  </div>

                  <Link
                    to="/technician/jobs"
                    className="px-3 py-1.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle"
                  >
                    Manage Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Wrench(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
