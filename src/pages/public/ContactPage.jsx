import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been sent to Fixify Support!');
  };

  return (
    <div className="min-h-screen bg-vanilla py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-orange font-heading">
            We're Here For You
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-navy mt-1 font-heading">
            Contact Fixify Support
          </h1>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Have questions about an upcoming service or technician partnership? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs space-y-6">
              <h3 className="text-xl font-bold text-primary-navy font-heading">
                Contact Information
              </h3>

              <div className="space-y-4 text-sm text-text-main">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-vanilla flex items-center justify-center text-primary-navy flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-navy">Head Office</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Level 4, Maker Chambers V, Nariman Point, Mumbai, Maharashtra 400021
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-vanilla flex items-center justify-center text-primary-navy flex-shrink-0">
                    <Phone className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-navy">Phone Support</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      1800-200-4545 (Toll Free) / +91 22 6123 4567
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-vanilla flex items-center justify-center text-primary-navy flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-navy">Email Support</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      support@fixify.in / grievances@fixify.in
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-vanilla flex items-center justify-center text-primary-navy flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-navy">Operating Hours</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Monday to Sunday: 8:00 AM – 9:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs">
              {submitted ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-navy font-heading">
                    Thank You for Contacting Us
                  </h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    We have received your message. A Fixify customer support representative will get back to you within 2 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="mt-4 px-4 py-2 bg-vanilla text-primary-navy text-xs font-semibold rounded-lg hover:bg-vanilla-dark"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-primary-navy font-heading mb-4">
                    Send Us a Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-primary-navy mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="E.g. Rajesh Patil"
                        className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary-navy mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rajesh@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-primary-navy mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98200 12345"
                        className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary-navy mb-1">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Booking Assistance">Booking Assistance</option>
                        <option value="Technician Application">Technician Application</option>
                        <option value="Complaint / Feedback">Complaint / Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary-navy mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we assist you today?"
                      className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
