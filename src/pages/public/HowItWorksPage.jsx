import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Choose your home service',
      desc: 'Browse our specialized categories from plumbing and electrical to AC servicing and deep home cleaning. Review transparent starting prices and whats included upfront.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Select a verified technician',
      desc: 'Pick your preferred technician based on ratings, verified skill credentials, and real customer reviews, or let Fixify dispatch our fastest nearby pro.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Pick a date and pin your location',
      desc: 'Choose a 2-hour arrival slot that fits your schedule. Drop your precise address pin on our interactive map so technicians arrive without asking for directions.',
      icon: Calendar,
    },
    {
      num: '04',
      title: 'Doorstep service & satisfaction check',
      desc: 'Our technician brings all necessary diagnostic tools and spare parts. Inspect the completed repair, approve the job, and pay with complete peace of mind.',
      icon: Award,
    },
  ];

  const faqs = [
    {
      q: 'How does Fixify verify technicians?',
      a: 'Every technician undergoes government ID (Aadhaar) verification, skill assessment, address verification, and background checks before taking jobs.',
    },
    {
      q: 'When do I need to pay?',
      a: 'You only pay after the service is satisfactorily completed. We do not require advance payments for standard service bookings.',
    },
    {
      q: 'What if the issue recurs after the technician leaves?',
      a: 'All standard repairs come with the Fixify 30-Day Service Guarantee. If the same issue recurs within 30 days, we dispatch a technician free of charge.',
    },
    {
      q: 'Can I reschedule or cancel a booking?',
      a: 'Yes, you can easily reschedule or cancel your booking through your Customer Dashboard at any time prior to the technician being on the way.',
    },
  ];

  return (
    <div className="min-h-screen bg-vanilla py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
            Simple & Transparent
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-navy mt-2 font-heading">
            How Fixify Works
          </h1>
          <p className="text-text-muted text-sm sm:text-base mt-3">
            We built Fixify to bring reliability, upfront pricing, and certified workmanship to Indian home services.
          </p>
        </div>

        {/* Steps Flow */}
        <div className="space-y-8 mb-20">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs flex flex-col md:flex-row items-start gap-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-navy text-accent-orange flex items-center justify-center font-extrabold text-2xl font-heading flex-shrink-0 shadow-xs">
                  {step.num}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-secondary-blue" />
                    <h3 className="text-xl font-bold text-primary-navy font-heading">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-border-subtle p-8 sm:p-10 shadow-xs mb-16">
          <div className="flex items-center gap-2 text-primary-navy font-heading font-bold text-2xl mb-8">
            <HelpCircle className="w-6 h-6 text-accent-orange" />
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-sm font-bold text-primary-navy font-heading">
                  {faq.q}
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-primary-navy text-white rounded-2xl p-8 sm:p-10 text-center space-y-4">
          <h3 className="text-2xl font-bold font-heading">Experience seamless home repairs</h3>
          <p className="text-sm text-white/80 max-w-lg mx-auto">
            Book trusted local professionals in your area now.
          </p>
          <div className="pt-2">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
