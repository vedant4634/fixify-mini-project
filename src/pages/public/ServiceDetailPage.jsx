import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
  PhoneCall,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadService() {
      try {
        const found = await api.services.getById(id);
        if (found) {
          setService(found);
          // Fetch technicians matching this category
          const allTechs = await api.technicians.getAll(found.name);
          setAvailableTechs(allTechs.filter((t) => t.verified));
        }
      } catch (err) {
        console.error('Failed to load service detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vanilla flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-navy border-t-accent-orange"></div>
          <p className="mt-3 text-sm text-text-muted">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-vanilla py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-border-subtle shadow-xs">
          <h2 className="text-xl font-bold text-primary-navy">Service Not Found</h2>
          <p className="text-xs text-text-muted mt-2">
            The service you are looking for might have been moved or removed.
          </p>
          <Link
            to="/services"
            className="mt-5 inline-block px-4 py-2 bg-primary-navy text-white text-xs font-semibold rounded-lg"
          >
            Browse All Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vanilla py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-primary-navy">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/services" className="hover:text-primary-navy">Services</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary-navy font-semibold">{service.name}</span>
        </div>

        {/* Main Service Presentation Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image and Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-md bg-white">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-orange">
                    Verified Fixify Service
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold text-primary-navy">
                    <Star className="w-4 h-4 fill-accent-orange text-accent-orange" />
                    <span>{service.rating}</span>
                    <span className="text-xs font-normal text-text-muted">
                      ({service.reviewsCount} verified reviews)
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy font-heading">
                  {service.name}
                </h1>

                <p className="text-sm sm:text-base text-text-muted mt-3 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* What's Included */}
              <div className="pt-6 border-t border-border-subtle">
                <h3 className="text-lg font-bold text-primary-navy font-heading mb-4">
                  What's Included in This Service
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.included?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-vanilla/60 border border-border-subtle text-xs text-text-main font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixify Assurance */}
              <div className="p-4 rounded-xl bg-vanilla-light border border-border-subtle flex items-center gap-3.5">
                <ShieldCheck className="w-8 h-8 text-secondary-blue flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-primary-navy">Fixify 30-Day Service Guarantee</p>
                  <p className="text-text-muted mt-0.5">
                    If something isn't right after the repair, we send a technician back for a free follow-up inspection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Widget */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-subtle shadow-md sticky top-24">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Transparent Pricing
              </span>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary-navy font-heading">
                  ₹{service.startingPrice}
                </span>
                <span className="text-sm text-text-muted">
                  {service.priceUnit}
                </span>
              </div>

              <p className="text-xs text-text-muted mt-2 pb-5 border-b border-border-subtle">
                Standard inspection and labor fee. Additional spare parts quoted upfront if needed.
              </p>

              <div className="py-5 space-y-3">
                <div className="flex items-center gap-3 text-xs text-text-main">
                  <Clock className="w-4 h-4 text-secondary-blue flex-shrink-0" />
                  <span>Doorstep technician arrival in 60-90 minutes</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-main">
                  <Calendar className="w-4 h-4 text-secondary-blue flex-shrink-0" />
                  <span>Choose your preferred date and 2-hour time slot</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-main">
                  <ShieldCheck className="w-4 h-4 text-secondary-blue flex-shrink-0" />
                  <span>Police & Aadhaar verified local technicians</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/customer/book-service?serviceId=${service.id}`)}
                className="w-full py-3.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Book This Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-[11px] text-text-muted">
                  Pay securely after service completion via Cash or UPI.
                </p>
              </div>
            </div>

            {/* Available Technicians for this category */}
            <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs">
              <h3 className="text-base font-bold text-primary-navy font-heading mb-4">
                Available Specialists ({availableTechs.length})
              </h3>

              <div className="space-y-3">
                {availableTechs.slice(0, 3).map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-vanilla/50 border border-border-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={tech.photo}
                        alt={tech.name}
                        className="w-10 h-10 rounded-full object-cover border border-border-subtle"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-primary-navy">{tech.name}</p>
                          <ShieldCheck className="w-3.5 h-3.5 text-secondary-blue" />
                        </div>
                        <p className="text-[11px] text-text-muted">
                          {tech.experience} exp &bull; ★ {tech.rating}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/customer/book-service?serviceId=${service.id}&techId=${tech.id}`)
                      }
                      className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-primary-navy hover:text-white text-primary-navy border border-border-subtle rounded-md transition-colors"
                    >
                      Select
                    </button>
                  </div>
                ))}

                {availableTechs.length === 0 && (
                  <p className="text-xs text-text-muted italic py-2">
                    Verified specialists ready to be assigned upon booking.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
