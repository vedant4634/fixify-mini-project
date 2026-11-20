import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Upload,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function TechnicianRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: 'Mumbai',
    address: '',
    category: 'Plumbing',
    experience: '5 years',
    skills: '',
    bio: '',
    hourlyRate: 350,
  });

  const [idDocName, setIdDocName] = useState('aadhaar_card_scan.pdf');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  );
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { registerTechnician } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone || !formData.skills) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      await registerTechnician({
        ...formData,
        photo: photoUrl,
        document: idDocName,
      });
      setSubmittedSuccess(true);
      toast.success('Technician application registered successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
      toast.error('Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-vanilla py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center text-white shadow-xs">
              <Wrench className="w-5 h-5 text-accent-orange" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary-navy font-heading">
              FIXIFY<span className="w-2 h-2 rounded-full bg-accent-orange ml-1 inline-block"></span>
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Technician Partner Registration
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Join India's trusted local home services network with transparent payouts
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-border-subtle shadow-md">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-primary-navy font-heading">
                Application Submitted
              </h2>

              {/* Verification Status Display */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-bold text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Status: Pending Verification
              </div>

              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Your application and submitted identity documents are currently under review by our operations team. You can still access your partner portal to view the interface.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate('/technician/dashboard')}
                  className="px-6 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Enter Technician Dashboard &rarr;
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Status Notice */}
              <div className="p-3 bg-vanilla/70 border border-border-subtle rounded-lg flex items-center gap-3 text-xs text-text-muted">
                <ShieldCheck className="w-5 h-5 text-secondary-blue flex-shrink-0" />
                <span>
                  New registrations start with <strong>Pending Verification</strong> status until admin approves identity documents.
                </span>
              </div>

              {/* Personal Details */}
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
                    placeholder="E.g. Rajesh Kumar"
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
                    placeholder="rajesh.plumbing@fixify.in"
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98201 44521"
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>
              </div>

              {/* Service Category & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Service Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical Repairs">Electrical Repairs</option>
                    <option value="AC Repair & Maintenance">AC Repair & Maintenance</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Home Maintenance">Home Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Operating City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="E.g. 6 years"
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Complete Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Local workshop or residential address in your operating city..."
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              {/* Skills and Description */}
              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Skills & Expertise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="E.g. Sanitary fittings, drainage jetting, motor pump repair"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Short Professional Description / Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Briefly state your trade background and certifications..."
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              {/* Photo & Document Upload Mockup */}
              <div className="pt-2 border-t border-border-subtle space-y-4">
                <p className="text-xs font-bold text-primary-navy uppercase tracking-wider">
                  Verification Documents & Profile Photo
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Selector */}
                  <div className="p-3.5 rounded-xl border border-dashed border-border-subtle bg-vanilla/40 flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-border-subtle flex-shrink-0"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-primary-navy">Profile Picture</p>
                      <p className="text-text-muted text-[11px]">Ready for customer profile</p>
                    </div>
                  </div>

                  {/* Document upload simulation */}
                  <div className="p-3.5 rounded-xl border border-dashed border-border-subtle bg-vanilla/40 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-navy/10 text-primary-navy flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-secondary-blue" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-primary-navy">Govt ID / Trade License</p>
                      <span className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {idDocName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span>{submitting ? 'Submitting Application...' : 'Register as Technician'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-text-muted">
            Already registered as a technician?{' '}
            <Link to="/technician/login" className="font-semibold text-secondary-blue hover:text-primary-navy">
              Sign in to Partner Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
