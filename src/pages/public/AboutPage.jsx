import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Award,
  Users,
  Target,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-vanilla py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
            Our Mission & Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-navy font-heading">
            Empowering Skilled Hands, Protecting Indian Homes
          </h1>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed">
            Fixify was founded with a straightforward goal: eliminate the daily hassle of finding trustworthy, skilled technicians for residential repairs across Indian cities.
          </p>
        </div>

        {/* Narrative & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-text-main text-sm leading-relaxed">
            <h2 className="text-2xl font-bold text-primary-navy font-heading">
              Why We Started Fixify
            </h2>
            <p className="text-text-muted">
              For years, urban homeowners have faced two major issues: unvetted local handymen with fluctuating prices and large corporate platforms with high service commissions that squeeze technicians.
            </p>
            <p className="text-text-muted">
              Fixify bridges this gap with an equitable, transparent local marketplace. Technicians get respectable earnings, dignity of labor, and prompt customer assignments; homeowners enjoy peace of mind with 30-day guarantees and verified ratings.
            </p>
            <div className="pt-2 space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>100% Aadhaar & Background Verified Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Upfront Standard Pricing without Hidden Surcharges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Fixify 30-Day Workmanship Guarantee</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-md bg-white">
            <img
              src="https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80"
              alt="Fixify Technician at home service"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-border-subtle shadow-xs space-y-2">
            <ShieldCheck className="w-8 h-8 text-secondary-blue" />
            <h3 className="text-base font-bold text-primary-navy font-heading">Safety & Trust First</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Every technician profile includes real customer reviews, job history, and verified identity badges.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border-subtle shadow-xs space-y-2">
            <HeartHandshake className="w-8 h-8 text-accent-orange" />
            <h3 className="text-base font-bold text-primary-navy font-heading">Fair Technician Wages</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We empower local independent tradesmen with consistent work without taking heavy commission cuts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border-subtle shadow-xs space-y-2">
            <Award className="w-8 h-8 text-primary-navy" />
            <h3 className="text-base font-bold text-primary-navy font-heading">Guaranteed Quality</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Our 30-day service warranty ensures issues get resolved properly without customer frustration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
