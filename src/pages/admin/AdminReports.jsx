import React from 'react';
import { BarChart3, TrendingUp, Users, CalendarCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminReports() {
  const serviceStats = [
    { name: 'Plumbing', bookings: 342, gross: '₹1,53,900', satisfaction: '98.5%' },
    { name: 'Electrical Repairs', bookings: 420, gross: '₹1,47,000', satisfaction: '99.1%' },
    { name: 'AC Repair & Maintenance', bookings: 512, gross: '₹4,09,600', satisfaction: '97.8%' },
    { name: 'Home Cleaning', bookings: 290, gross: '₹2,60,710', satisfaction: '96.5%' },
    { name: 'Carpentry', bookings: 185, gross: '₹74,000', satisfaction: '97.2%' },
    { name: 'Appliance Repair', bookings: 388, gross: '₹1,35,800', satisfaction: '98.0%' },
  ];

  const cityPerformance = [
    { city: 'Mumbai', share: '38%', activeTechs: 42, avgResponse: '14 mins' },
    { city: 'Bengaluru', share: '24%', activeTechs: 28, avgResponse: '16 mins' },
    { city: 'Delhi NCR', share: '20%', activeTechs: 25, avgResponse: '18 mins' },
    { city: 'Pune', share: '12%', activeTechs: 15, avgResponse: '15 mins' },
    { city: 'Hyderabad', share: '6%', activeTechs: 8, avgResponse: '22 mins' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Platform Operational Reports
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Aggregated analytics, service category performance, and city coverage reports
        </p>
      </div>

      {/* Top Level Metric Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Average Arrival Response</span>
          <span className="text-3xl font-extrabold text-primary-navy font-heading mt-1 block">
            15.8 Mins
          </span>
          <span className="text-[11px] text-green-700 font-semibold mt-1 block">&darr; 2.4 mins faster than last month</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Service Completion Rate</span>
          <span className="text-3xl font-extrabold text-green-700 font-heading mt-1 block">
            97.6%
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">First-visit resolution efficiency</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
          <span className="text-xs text-text-muted block">Customer Repeat Rate</span>
          <span className="text-3xl font-extrabold text-secondary-blue font-heading mt-1 block">
            41.2%
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Booked 2+ home services in 6 months</span>
        </div>
      </div>

      {/* Service Category Performance Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-base font-bold text-primary-navy font-heading">
            Category Breakdown & Volume
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Aggregated service billing and customer satisfaction metrics
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-main">
            <thead className="bg-vanilla/60 border-b border-border-subtle text-[11px] uppercase font-bold text-primary-navy">
              <tr>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Completed Bookings</th>
                <th className="py-3 px-4">Gross Service Value</th>
                <th className="py-3 px-4">Satisfaction Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {serviceStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-vanilla/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-primary-navy">{item.name}</td>
                  <td className="py-3.5 px-4">{item.bookings} jobs</td>
                  <td className="py-3.5 px-4 font-bold text-primary-navy">{item.gross}</td>
                  <td className="py-3.5 px-4 text-green-700 font-bold">{item.satisfaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* City Coverage */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-primary-navy font-heading">
          Regional City Coverage & Density
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cityPerformance.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-vanilla/50 border border-border-subtle text-xs">
              <span className="font-bold text-primary-navy block text-sm">{c.city}</span>
              <span className="text-text-muted block mt-1">Platform Share: <strong>{c.share}</strong></span>
              <span className="text-text-muted block mt-0.5">Active Pros: <strong>{c.activeTechs}</strong></span>
              <span className="text-text-muted block mt-0.5">Avg Response: <strong>{c.avgResponse}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
