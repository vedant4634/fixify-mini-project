import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TechnicianEarnings() {
  const { user } = useAuth();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.bookings.getAll();
        const done = (data || []).filter((j) => j.status === 'Completed');
        setCompletedJobs(done);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalGross = completedJobs.reduce((acc, curr) => acc + (Number(curr.estimatedPrice) || 350), 0);
  const platformFee = Math.round(totalGross * 0.1); // 10% Fixify platform facilitation fee
  const netEarnings = totalGross - platformFee;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Earnings & Payouts
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Transparent breakdown of completed doorstep service collections and weekly direct payouts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Gross Service Value</span>
          <span className="text-3xl font-extrabold text-primary-navy font-heading mt-1 block">
            ₹{totalGross}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Total billed across {completedJobs.length} jobs</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Platform Facilitation (10%)</span>
          <span className="text-3xl font-extrabold text-amber-700 font-heading mt-1 block">
            ₹{platformFee}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Includes customer insurance & dispatch</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs bg-gradient-to-br from-white to-green-50/50">
          <span className="text-xs font-bold text-green-700 block">Net Take-Home Earnings</span>
          <span className="text-3xl font-extrabold text-green-700 font-heading mt-1 block">
            ₹{netEarnings}
          </span>
          <span className="text-[11px] text-green-700 font-medium mt-1 block">Direct bank transfer weekly</span>
        </div>
      </div>

      {/* Payment Transparency Notice */}
      <div className="p-4 rounded-xl bg-vanilla/70 border border-border-subtle flex items-start gap-3 text-xs text-text-muted">
        <ShieldCheck className="w-5 h-5 text-secondary-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-primary-navy">Fixify Transparent Partner Policy</p>
          <p className="mt-0.5">
            Cash collected directly from customers is credited against your weekly settlement. No hidden penalties or arbitrary chargebacks.
          </p>
        </div>
      </div>

      {/* Completed Orders Settlement List */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-base font-bold text-primary-navy font-heading">
            Settled Service History
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Verified completed work ready for disbursement
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading settlement records...</div>
        ) : completedJobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted">
            No completed jobs settled yet.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {completedJobs.map((job) => {
              const gross = Number(job.estimatedPrice) || 350;
              const fee = Math.round(gross * 0.1);
              const net = gross - fee;

              return (
                <div key={job.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary-navy bg-vanilla px-2 py-0.5 rounded border border-border-subtle">
                        {job.id}
                      </span>
                      <h4 className="text-sm font-bold text-primary-navy">{job.serviceName}</h4>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Customer: {job.customerName} &bull; Date: {job.date} &bull; {job.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-text-muted block">Net Payout</span>
                    <span className="text-sm font-bold text-green-700">₹{net}</span>
                    <span className="text-[10px] text-text-muted block">(Gross: ₹{gross})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
