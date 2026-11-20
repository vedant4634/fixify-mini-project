import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-navy text-white pt-16 pb-8 border-t border-secondary-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-orange flex items-center justify-center text-primary-navy font-bold">
                <Wrench className="w-5 h-5 text-primary-navy" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-heading">
                FIXIFY<span className="w-2 h-2 rounded-full bg-accent-orange ml-1 inline-block"></span>
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Your trusted marketplace for verified local home services. Connecting skilled Indian technicians with households for quick, reliable, and transparent repairs.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-orange" />
                <span>Background Verified Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-orange" />
                <span>30-Day Service Guarantee</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent-orange font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">All Services</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Fixify</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Service Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent-orange font-heading">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link to="/services/plumbing" className="hover:text-white transition-colors">Plumbing</Link>
              </li>
              <li>
                <Link to="/services/electrical" className="hover:text-white transition-colors">Electrical Repairs</Link>
              </li>
              <li>
                <Link to="/services/ac-repair" className="hover:text-white transition-colors">AC Servicing</Link>
              </li>
              <li>
                <Link to="/services/cleaning" className="hover:text-white transition-colors">Home Cleaning</Link>
              </li>
              <li>
                <Link to="/services/carpentry" className="hover:text-white transition-colors">Carpentry Work</Link>
              </li>
              <li>
                <Link to="/services/appliance-repair" className="hover:text-white transition-colors">Appliance Repair</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent-orange font-heading">
              Get In Touch
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
                <span>Level 4, Maker Chambers V, Nariman Point, Mumbai 400021</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-orange flex-shrink-0" />
                <span>1800-200-4545 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-orange flex-shrink-0" />
                <span>support@fixify.in</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent-orange flex-shrink-0" />
                <span>Mon - Sun: 8:00 AM - 9:00 PM</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-1 text-xs text-white/60">
              <Link to="/technician/login" className="hover:text-accent-orange transition-colors">
                Technician Partner Login &rarr;
              </Link>
              <Link to="/admin/login" className="hover:text-accent-orange transition-colors">
                Administrator Portal &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>
            &copy; {new Date().getFullYear()} Fixify Technologies India Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span>Built with precision for Academic Demonstration</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
