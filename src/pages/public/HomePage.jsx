import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Hammer,
  Paintbrush,
  Tv,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  MapPin,
  ChevronRight,
  Award,
  Users,
  Search
} from 'lucide-react';
import { api } from '../../services/api';
import { TESTIMONIALS } from '../../services/mockData';

// Dynamic Lucide icon mapper
const iconMap = {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Hammer,
  Paintbrush,
  Tv,
  ShieldCheck,
};

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [featuredTechs, setFeaturedTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [servData, techData] = await Promise.all([
          api.services.getAll(),
          api.technicians.getAll()
        ]);
        setServices(servData || []);
        // Take verified techs with highest rating
        setFeaturedTechs((techData || []).filter(t => t.verified).slice(0, 4));
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="min-h-screen bg-vanilla">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-border-subtle bg-gradient-to-b from-white/60 to-vanilla">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border-subtle text-xs font-semibold text-primary-navy shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-accent-orange" />
                <span>Trusted professionals. Easy bookings. Reliable service.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-navy tracking-tight leading-[1.15] font-heading">
                Your Home Deserves the <span className="text-secondary-blue underline decoration-accent-orange/80 decoration-4">Right Help.</span>
              </h1>

              <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                Find trusted local professionals for everyday home repairs and services. Book easily, relax and let Fixify handle the rest.
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl p-2 bg-white rounded-xl border border-border-subtle shadow-md">
                <div className="flex items-center gap-2 px-3 flex-1">
                  <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="E.g. AC service, tap leakage, electrician..."
                    className="w-full py-2 bg-transparent text-sm text-text-main focus:outline-none placeholder:text-text-muted"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Call to action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/services"
                  className="px-6 py-3.5 bg-primary-navy hover:bg-secondary-blue text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Explore Services</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/technician/register"
                  className="px-6 py-3.5 bg-white hover:bg-vanilla text-primary-navy font-semibold text-sm rounded-lg border border-border-subtle transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <Wrench className="w-4 h-4 text-accent-orange" />
                  <span>Become a Technician</span>
                </Link>
              </div>

              {/* Verified Cities indicator */}
              <div className="pt-4 flex items-center gap-2 text-xs text-text-muted">
                <MapPin className="w-4 h-4 text-accent-orange flex-shrink-0" />
                <span>Now serving Mumbai, Delhi NCR, Bengaluru, Pune & Hyderabad</span>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
                    alt="Professional Fixify Technician at work"
                    className="w-full h-[400px] object-cover"
                  />
                </div>

                {/* Floating Micro-Card: Guarantee */}
                <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white p-4 rounded-xl border border-border-subtle shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-orange/20 text-accent-orange flex items-center justify-center font-bold">
                    <Award className="w-6 h-6 text-accent-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium">Fixify Quality Promise</p>
                    <p className="text-sm font-bold text-primary-navy">100% Verified Experts</p>
                  </div>
                </div>

                {/* Floating Micro-Card: Fast Booking */}
                <div className="absolute -top-4 -right-4 bg-white px-4 py-3 rounded-xl border border-border-subtle shadow-lg hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs font-semibold text-primary-navy">
                    Average response in 15 mins
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICE CATEGORIES */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
            Categorized Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy mt-1 font-heading">
            What Can We Help You Fix Today?
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Choose from our specialized doorstep repair and maintenance categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Wrench;
            return (
              <div
                key={cat.id}
                className="group bg-white rounded-xl border border-border-subtle overflow-hidden shadow-xs hover:shadow-md hover:border-secondary-blue/40 transition-all duration-200 flex flex-col"
              >
                {/* Service Card Image */}
                <div className="relative h-44 overflow-hidden bg-vanilla-dark">
                  <img
                    src={cat.image || '/images/services/default.svg'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      const catId = (cat.id || cat.slug || cat.name || '').toLowerCase();
                      if (catId.includes('elect')) e.currentTarget.src = '/images/services/electrical.svg';
                      else if (catId.includes('plumb')) e.currentTarget.src = '/images/services/plumbing.svg';
                      else if (catId.includes('carp')) e.currentTarget.src = '/images/services/carpentry.svg';
                      else e.currentTarget.src = '/images/services/default.svg';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-lg text-primary-navy shadow-xs">
                    <IconComponent className="w-5 h-5 text-primary-navy" />
                  </div>
                  {cat.popular && (
                    <div className="absolute top-3 right-3 bg-accent-orange text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      Popular
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary-navy font-heading group-hover:text-secondary-blue transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.shortDesc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-text-muted block">Starting at</span>
                      <span className="text-base font-bold text-primary-navy">
                        ₹{cat.startingPrice}{' '}
                        <span className="text-xs font-normal text-text-muted">
                          {cat.priceUnit}
                        </span>
                      </span>
                    </div>

                    <Link
                      to={`/services/${cat.slug || cat.id}`}
                      className="px-3 py-1.5 bg-vanilla hover:bg-accent-orange hover:text-white text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle transition-colors flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-vanilla text-primary-navy font-semibold text-sm rounded-lg border border-border-subtle shadow-xs transition-colors"
          >
            <span>View All Available Services</span>
            <ArrowRight className="w-4 h-4 text-accent-orange" />
          </Link>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-16 bg-white border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
              Effortless Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy mt-1 font-heading">
              How Fixify Works in 4 Simple Steps
            </h2>
            <p className="text-text-muted text-sm sm:text-base mt-2">
              From booking to doorstep service, we take the stress out of home repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-xl bg-vanilla/40 border border-border-subtle flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-navy text-accent-orange flex items-center justify-center font-bold text-xl mb-4 font-heading shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-primary-navy font-heading">
                Choose your service
              </h3>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Browse our curated categories, select the required repair, and check transparent upfront pricing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-xl bg-vanilla/40 border border-border-subtle flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-navy text-accent-orange flex items-center justify-center font-bold text-xl mb-4 font-heading shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-primary-navy font-heading">
                Find a local professional
              </h3>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Browse verified technicians in your locality, review ratings, experience, and certifications.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-xl bg-vanilla/40 border border-border-subtle flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-navy text-accent-orange flex items-center justify-center font-bold text-xl mb-4 font-heading shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-primary-navy font-heading">
                Schedule your booking
              </h3>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Pick a date and convenient time slot that fits your day, and pin your exact address on our map.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-xl bg-vanilla/40 border border-border-subtle flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-navy text-accent-orange flex items-center justify-center font-bold text-xl mb-4 font-heading shadow-xs">
                4
              </div>
              <h3 className="text-base font-bold text-primary-navy font-heading">
                Get your service completed
              </h3>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Our technician arrives on time with professional tools. Relax while they get the job done right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE FIXIFY */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
              Our Value Guarantee
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy font-heading leading-tight">
              Why Indian Households Trust Fixify
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              We eliminate the uncertainty of unverified street contractors with rigorous vetting, fair rates, and responsive customer support.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary-navy text-accent-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-navy font-heading">Verified professionals</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Government ID (Aadhaar) and skill verification before any technician is onboarded.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary-navy text-accent-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-navy font-heading">Transparent pricing</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Clear upfront price estimates with zero hidden charges or last-minute surprises.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary-navy text-accent-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-navy font-heading">Easy booking process</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Book in under two minutes with multi-step slot selection and live map pin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary-navy text-accent-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-navy font-heading">Local technicians</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Technicians from your own neighbourhood for faster arrival and local accountability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary-navy text-accent-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-navy font-heading">Booking management</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Dedicated customer dashboard to track jobs, view technician details, and review service history.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-sm border border-border-subtle bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
                    alt="Home cleaning service"
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-3 text-center">
                    <p className="text-xs font-semibold text-primary-navy">Spotless Deep Cleaning</p>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-primary-navy text-white shadow-sm flex flex-col justify-center">
                  <p className="text-3xl font-extrabold text-accent-orange font-heading">98.4%</p>
                  <p className="text-xs text-white/80 mt-1">Customer satisfaction across 4,200+ completed local service orders.</p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="p-5 rounded-xl bg-white border border-border-subtle shadow-sm flex flex-col justify-center">
                  <p className="text-3xl font-extrabold text-primary-navy font-heading">30 Days</p>
                  <p className="text-xs text-text-muted mt-1">Fixify service guarantee on all plumbing, electrical, and appliance jobs.</p>
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm border border-border-subtle bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80"
                    alt="Plumbing pipe maintenance"
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-3 text-center">
                    <p className="text-xs font-semibold text-primary-navy">Precision Plumbing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED TECHNICIANS */}
      <section className="py-16 bg-white border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
                Top Rated Pros
              </span>
              <h2 className="text-3xl font-bold text-primary-navy mt-1 font-heading">
                Meet Our Verified Local Technicians
              </h2>
            </div>
            <Link
              to="/services"
              className="mt-3 sm:mt-0 text-sm font-semibold text-secondary-blue hover:text-primary-navy flex items-center gap-1"
            >
              <span>Explore all technicians</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTechs.map((tech) => (
              <div
                key={tech.id}
                className="p-5 rounded-xl bg-vanilla/50 border border-border-subtle hover:border-secondary-blue/40 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <img
                      src={tech.photo}
                      alt={tech.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-primary-navy font-heading">{tech.name}</h4>
                        <ShieldCheck className="w-4 h-4 text-secondary-blue" title="Verified" />
                      </div>
                      <span className="text-xs text-text-muted block mt-0.5">{tech.category}</span>
                      <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-primary-navy">
                        <Star className="w-3.5 h-3.5 fill-accent-orange text-accent-orange" />
                        <span>{tech.rating}</span>
                        <span className="text-[11px] text-text-muted font-normal">({tech.jobsCompleted} jobs)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted mt-3 line-clamp-2 leading-relaxed">
                    {tech.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-[11px] text-text-muted">
                    <span className="font-semibold text-primary-navy">{tech.experience}</span> exp
                    <span className="mx-1">&bull;</span>
                    <span>{tech.city}</span>
                  </div>

                  <Link
                    to={`/customer/book-service?techId=${tech.id}`}
                    className="px-3 py-1.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
            Real Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy mt-1 font-heading">
            What Our Customers Say
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Read authentic feedback from homeowners who rely on Fixify every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-xl bg-white border border-border-subtle shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent-orange text-accent-orange" />
                  ))}
                </div>
                <p className="text-sm text-text-main leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border-subtle">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-border-subtle"
                />
                <div>
                  <h4 className="text-sm font-bold text-primary-navy font-heading">{t.name}</h4>
                  <p className="text-xs text-text-muted">{t.role} &bull; <span className="text-secondary-blue font-medium">{t.service}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SIMPLE CTA SECTION */}
      <section className="py-16 bg-primary-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Ready to get your home fixed with zero hassle?
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied homeowners. Book a verified technician in under 2 minutes with guaranteed workmanship.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/services"
              className="px-8 py-3.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-bold rounded-lg shadow-md transition-colors"
            >
              Book a Service Now
            </Link>
            <Link
              to="/technician/register"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-colors"
            >
              Register as a Technician
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
