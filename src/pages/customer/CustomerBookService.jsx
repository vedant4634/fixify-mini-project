import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Star,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import MapPicker from '../../components/common/MapPicker';

export default function CustomerBookService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const initialServiceId = searchParams.get('serviceId') || 'plumbing';
  const initialTechId = searchParams.get('techId') || '';

  // Step state (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Data states
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [selectedService, setSelectedService] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || 'Kavita Iyer',
    phone: user?.phone || '+91 98200 12345',
    address: user?.address || 'Flat 402, Sea Green Apts, Juhu Tara Road',
    city: user?.city || 'Mumbai',
    pincode: user?.pincode || '400049',
    lat: 19.1025,
    lng: 72.8271,
    description: '',
  });

  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Available slots
  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [servList, techList] = await Promise.all([
          api.services.getAll(),
          api.technicians.getAll()
        ]);
        setServices(servList || []);
        setTechnicians(techList || []);

        const foundService = servList?.find((s) => s.id === initialServiceId || s.slug === initialServiceId) || servList?.[0];
        setSelectedService(foundService);

        if (initialTechId) {
          const foundTech = techList?.find((t) => t.id === initialTechId);
          if (foundTech) setSelectedTechnician(foundTech);
        }
      } catch (err) {
        console.error('Failed to load booking dependencies', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialServiceId, initialTechId]);

  // Technicians matching selected service
  const filteredTechnicians = technicians.filter((t) => {
    if (!selectedService) return true;
    return t.category.toLowerCase().includes(selectedService.name.toLowerCase());
  });

  // Handle Confirm Booking
  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customerId: user?.id || 'cust-1',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        technicianId: selectedTechnician?.id || (filteredTechnicians[0]?.id || null),
        technicianName: selectedTechnician?.name || (filteredTechnicians[0]?.name || 'Unassigned'),
        technicianPhone: selectedTechnician?.phone || (filteredTechnicians[0]?.phone || ''),
        date: bookingDate,
        timeSlot: selectedTimeSlot,
        address: customerInfo.address,
        city: customerInfo.city,
        pincode: customerInfo.pincode,
        lat: customerInfo.lat,
        lng: customerInfo.lng,
        estimatedPrice: selectedService?.startingPrice || 350,
        description: customerInfo.description || 'Standard inspection and maintenance.',
      };

      const result = await api.bookings.create(payload);
      setConfirmedBooking(result);
      setCurrentStep(6);
      toast.success('Your home service appointment has been scheduled!');
    } catch (err) {
      toast.error('Booking failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vanilla py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-navy border-t-accent-orange"></div>
        <p className="mt-3 text-sm text-text-muted">Initializing booking flow...</p>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Date & Time' },
    { num: 4, label: 'Technician' },
    { num: 5, label: 'Summary' },
    { num: 6, label: 'Confirmation' },
  ];

  return (
    <div className="min-h-screen bg-vanilla py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
            <Link to="/" className="hover:text-primary-navy">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/services" className="hover:text-primary-navy">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-navy font-semibold">Book a Service</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
            Schedule Home Service
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Book verified local technicians with guaranteed quality and upfront pricing
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
            {stepsList.map((st, i) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <div key={st.num} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPast
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-primary-navy text-accent-orange ring-2 ring-accent-orange/40'
                          : 'bg-vanilla text-text-muted'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isCurrent ? 'text-primary-navy' : 'text-text-muted'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                  {i < stepsList.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-3 ${
                        isPast ? 'bg-green-600' : 'bg-border-subtle'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-xs p-6 sm:p-8">
          {/* STEP 1: SELECT SERVICE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary-navy font-heading">
                  Step 1: Select Service Category
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Choose the service you need or switch to a different home repair category
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((serv) => {
                  const isSelected = selectedService?.id === serv.id;
                  return (
                    <div
                      key={serv.id}
                      onClick={() => setSelectedService(serv)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-accent-orange bg-vanilla/40 shadow-xs ring-1 ring-accent-orange'
                          : 'border-border-subtle bg-white hover:bg-vanilla/20'
                      }`}
                    >
                      <img
                        src={serv.image}
                        alt={serv.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-primary-navy">{serv.name}</h4>
                          <span className="text-xs font-bold text-primary-navy">
                            ₹{serv.startingPrice}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 line-clamp-2">
                          {serv.shortDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Continue to Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary-navy font-heading">
                  Step 2: Service Location & Contact
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Provide your address and drop a pin on OpenStreetMap for smooth technician arrival
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Full Street Address (Flat / House No., Society / Building) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="E.g. Flat 402, Sea Green Apts, Juhu Tara Road, near J.W. Marriott"
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-navy mb-1">
                    City *
                  </label>
                  <select
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
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
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.pincode}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, pincode: e.target.value })}
                    placeholder="E.g. 400049"
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                  />
                </div>
              </div>

              {/* Interactive OpenStreetMap Pin Picker */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-primary-navy mb-2">
                  Pin Precise Location on OpenStreetMap (Optional)
                </label>
                <MapPicker
                  lat={customerInfo.lat}
                  lng={customerInfo.lng}
                  popupText={customerInfo.address || 'Selected Location'}
                  onLocationSelect={(lat, lng) => {
                    setCustomerInfo((prev) => ({ ...prev, lat, lng }));
                    toast.info(`Location pinned: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-1">
                  Describe the Issue or Specific Instructions
                </label>
                <textarea
                  rows={2}
                  value={customerInfo.description}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, description: e.target.value })}
                  placeholder="Describe the leak, noise, damage, or specific spare parts required..."
                  className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-primary-navy"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
                      toast.error('Please enter customer name, phone and address.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Continue to Date & Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE AND TIME */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary-navy font-heading">
                  Step 3: Select Date & Time Slot
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Choose when you would like the technician to visit your residence
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-2">
                  Select Preferred Date
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue font-semibold text-primary-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-navy mb-2">
                  Select 2-Hour Arrival Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-3.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'border-accent-orange bg-vanilla font-bold text-primary-navy ring-1 ring-accent-orange'
                            : 'border-border-subtle bg-white hover:bg-vanilla/40 text-text-main'
                        }`}
                      >
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-accent-orange' : 'text-text-muted'}`} />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-primary-navy"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Select Technician</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELECT TECHNICIAN */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary-navy font-heading">
                  Step 4: Select Verified Technician
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Choose a specialist for {selectedService?.name} or select our auto-dispatch option
                </p>
              </div>

              <div className="space-y-3">
                {/* Auto assign option */}
                <div
                  onClick={() => setSelectedTechnician(null)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTechnician === null
                      ? 'border-accent-orange bg-vanilla/50 ring-1 ring-accent-orange'
                      : 'border-border-subtle bg-white hover:bg-vanilla/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-navy text-accent-orange flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary-navy">
                        Auto-Assign Nearest Verified Technician
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Fixify will dispatch the fastest available 4.8+ rated specialist in your city
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-accent-orange">Recommended</span>
                </div>

                {filteredTechnicians.map((tech) => {
                  const isSelected = selectedTechnician?.id === tech.id;
                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnician(tech)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-accent-orange bg-vanilla/50 ring-1 ring-accent-orange'
                          : 'border-border-subtle bg-white hover:bg-vanilla/20'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={tech.photo}
                          alt={tech.name}
                          className="w-12 h-12 rounded-full object-cover border border-border-subtle flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-primary-navy">{tech.name}</h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-secondary-blue" />
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-100 text-green-800 font-semibold">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">{tech.skills}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                            <span className="font-semibold text-primary-navy flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-accent-orange text-accent-orange" />
                              {tech.rating}
                            </span>
                            <span>&bull;</span>
                            <span>{tech.experience} experience</span>
                            <span>&bull;</span>
                            <span>{tech.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:pl-4">
                        <span className="text-xs font-bold text-primary-navy">
                          ₹{tech.hourlyRate || 350}/visit
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-primary-navy"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Review Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING SUMMARY */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary-navy font-heading">
                  Step 5: Review Booking Summary
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Check all appointment details before final confirmation
                </p>
              </div>

              <div className="p-5 rounded-xl bg-vanilla/60 border border-border-subtle space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-border-subtle">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-text-muted">
                      Selected Service
                    </span>
                    <h3 className="text-base font-bold text-primary-navy font-heading">
                      {selectedService?.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase font-bold text-text-muted">
                      Estimated Inspection
                    </span>
                    <p className="text-lg font-extrabold text-primary-navy">
                      ₹{selectedService?.startingPrice}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-muted block">Scheduled Date & Time:</span>
                    <span className="font-semibold text-primary-navy">
                      {bookingDate} &bull; {selectedTimeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block">Technician:</span>
                    <span className="font-semibold text-primary-navy">
                      {selectedTechnician?.name || 'Nearest Available Pro (Auto-Assign)'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-text-muted block">Service Address:</span>
                    <span className="font-semibold text-primary-navy">
                      {customerInfo.address}, {customerInfo.city} - {customerInfo.pincode}
                    </span>
                  </div>

                  {customerInfo.description && (
                    <div className="sm:col-span-2">
                      <span className="text-text-muted block">Notes / Issue Description:</span>
                      <span className="text-text-main italic">{customerInfo.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Clarification (No fake payment success) */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Transparent Doorstep Payment</p>
                  <p className="mt-0.5 text-amber-800">
                    No advance payment required today. Pay the technician via Cash or UPI QR Code directly once the service is completed to your satisfaction.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-primary-navy"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className={`px-8 py-3 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{submitting ? 'Confirming Appointment...' : 'Confirm Booking'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: BOOKING CONFIRMATION */}
          {currentStep === 6 && confirmedBooking && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                  Appointment Scheduled
                </span>
                <h2 className="text-2xl font-bold text-primary-navy font-heading mt-1">
                  Booking Confirmed!
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Your local home service request has been received and registered.
                </p>
              </div>

              {/* Booking Ticket Card */}
              <div className="max-w-md mx-auto p-5 rounded-xl bg-vanilla/60 border border-border-subtle text-left space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Booking Reference</span>
                    <p className="text-sm font-bold text-primary-navy">{confirmedBooking.id}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-bold">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Service:</span>
                    <span className="font-semibold text-primary-navy">{confirmedBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Technician Assigned:</span>
                    <span className="font-semibold text-primary-navy">{confirmedBooking.technicianName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Date & Slot:</span>
                    <span className="font-semibold text-primary-navy">
                      {confirmedBooking.date} ({confirmedBooking.timeSlot})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Estimated Price:</span>
                    <span className="font-bold text-primary-navy">₹{confirmedBooking.estimatedPrice}</span>
                  </div>
                  <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                    <p>Address: {confirmedBooking.address}, {confirmedBooking.city}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate('/customer/bookings')}
                  className="px-6 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  View My Bookings &rarr;
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 bg-vanilla hover:bg-vanilla-dark text-primary-navy text-xs font-semibold rounded-lg border border-border-subtle"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
