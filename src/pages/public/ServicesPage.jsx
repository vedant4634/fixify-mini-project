import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Hammer,
  Paintbrush,
  Tv,
  ShieldCheck,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

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

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'All');

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await api.services.getAll();
        setServices(data || []);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const categories = ['All', ...services.map((s) => s.name)];

  const filteredServices = services.filter((s) => {
    const matchesCategory =
      selectedCategory === 'All' || s.name.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-vanilla py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
            <Link to="/" className="hover:text-primary-navy">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-navy font-semibold">Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy font-heading">
            Our Home Services
          </h1>
          <p className="text-text-muted text-sm sm:text-base mt-2 max-w-2xl">
            Choose from certified local home service professionals with upfront transparent pricing and Fixify warranty.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. plumbing, AC, cleaning)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-vanilla/50 rounded-lg border border-border-subtle focus:outline-none focus:border-secondary-blue"
            />
          </div>

          {/* Category Filter Pills (Scrollable on small screens) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-text-muted flex-shrink-0 ml-1 mr-1 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-navy text-white shadow-xs'
                    : 'bg-vanilla text-text-muted hover:text-primary-navy hover:bg-vanilla-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-navy border-t-accent-orange"></div>
            <p className="mt-3 text-sm text-text-muted">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl border border-border-subtle p-12 text-center max-w-md mx-auto">
            <Search className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-primary-navy">No services found</h3>
            <p className="text-xs text-text-muted mt-1">
              No results matching "{searchQuery}". Try different keywords or reset your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComp = iconMap[service.icon] || Wrench;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-vanilla-dark">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-lg text-primary-navy shadow-xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="absolute top-3 right-3 bg-primary-navy/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md">
                        ★ {service.rating} ({service.reviewsCount})
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-primary-navy font-heading">
                        {service.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Included checklist preview */}
                      <div className="mt-4 pt-3 border-t border-border-subtle space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase text-secondary-blue">
                          Includes:
                        </p>
                        {service.included?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-text-muted">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-2">
                    <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-text-muted block">Estimated starting price</span>
                        <span className="text-xl font-extrabold text-primary-navy">
                          ₹{service.startingPrice}{' '}
                          <span className="text-xs font-normal text-text-muted">
                            {service.priceUnit}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/services/${service.slug || service.id}`}
                          className="px-3 py-2 text-xs font-semibold text-primary-navy hover:bg-vanilla rounded-lg transition-colors border border-border-subtle"
                        >
                          Details
                        </Link>
                        <Link
                          to={`/customer/book-service?serviceId=${service.id}`}
                          className="px-4 py-2 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
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
