import React, { useState } from 'react';
import { Calendar, Clock, Check, AlertCircle, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function TechnicianAvailability() {
  const toast = useToast();
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [workingDays, setWorkingDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: false,
  });

  const [shifts, setShifts] = useState({
    morning: true,   // 8 AM - 12 PM
    afternoon: true, // 12 PM - 4 PM
    evening: true,   // 4 PM - 8 PM
  });

  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Your working hours and shift availability have been saved!');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Availability & Shift Management
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Set your active working days and hours to control incoming customer booking requests
        </p>
      </div>

      {/* Online / Offline Master Switch */}
      <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-primary-navy font-heading">
            Live Duty Status
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {isAvailableToday
              ? 'You are active and visible to nearby customers seeking repairs.'
              : 'You are marked offline. No new requests will be sent to your phone.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAvailableToday(!isAvailableToday);
            toast.info(`Duty status: ${!isAvailableToday ? 'Online' : 'Offline'}`);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-2xs ${
            isAvailableToday
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-vanilla text-text-muted hover:bg-vanilla-dark'
          }`}
        >
          {isAvailableToday ? '● Online (Active)' : '○ Offline (Rest)'}
        </button>
      </div>

      {/* Weekly Working Days */}
      <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-primary-navy font-heading flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary-blue" />
          <span>Weekly Operating Days</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(workingDays).map(([day, enabled]) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`p-3 rounded-xl border text-center transition-all ${
                enabled
                  ? 'border-secondary-blue bg-secondary-blue/10 text-primary-navy font-bold'
                  : 'border-border-subtle bg-vanilla/40 text-text-muted'
              }`}
            >
              <span className="text-xs block">{day.slice(0, 3)}</span>
              <span className="text-[10px] mt-1 block">
                {enabled ? 'Active' : 'Off'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Operating Shifts */}
      <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-primary-navy font-heading flex items-center gap-2">
          <Clock className="w-4 h-4 text-secondary-blue" />
          <span>Daily Service Windows</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:bg-vanilla/30 cursor-pointer">
            <div>
              <p className="font-bold text-primary-navy">Morning Shift</p>
              <p className="text-[11px] text-text-muted">08:00 AM - 12:00 PM</p>
            </div>
            <input
              type="checkbox"
              checked={shifts.morning}
              onChange={(e) => setShifts({ ...shifts, morning: e.target.checked })}
              className="w-4 h-4 rounded text-secondary-blue"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:bg-vanilla/30 cursor-pointer">
            <div>
              <p className="font-bold text-primary-navy">Afternoon Shift</p>
              <p className="text-[11px] text-text-muted">12:00 PM - 04:00 PM</p>
            </div>
            <input
              type="checkbox"
              checked={shifts.afternoon}
              onChange={(e) => setShifts({ ...shifts, afternoon: e.target.checked })}
              className="w-4 h-4 rounded text-secondary-blue"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle hover:bg-vanilla/30 cursor-pointer">
            <div>
              <p className="font-bold text-primary-navy">Evening Shift</p>
              <p className="text-[11px] text-text-muted">04:00 PM - 08:00 PM</p>
            </div>
            <input
              type="checkbox"
              checked={shifts.evening}
              onChange={(e) => setShifts({ ...shifts, evening: e.target.checked })}
              className="w-4 h-4 rounded text-secondary-blue"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-border-subtle flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Availability'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
