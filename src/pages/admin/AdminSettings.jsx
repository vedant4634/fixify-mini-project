import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Mail, Phone, Sliders } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const toast = useToast();
  const [platformConfig, setPlatformConfig] = useState({
    commissionRate: 10,
    supportEmail: 'support@fixify.in',
    tollFreeNumber: '1800-200-4545',
    maxDispatchRadiusKm: 15,
    autoAssignVerifiedOnly: true,
    requireAadhaarVerification: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Platform operations settings saved.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Platform Governance & Rules
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Configure commission take-rates, customer helpline, and technician verification enforcement
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-xs">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary-navy font-heading border-b border-border-subtle pb-2">
              Fee & Dispatch Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-primary-navy mb-1">
                  Technician Facilitation Fee (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={platformConfig.commissionRate}
                  onChange={(e) =>
                    setPlatformConfig({ ...platformConfig, commissionRate: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
                <span className="text-[10px] text-text-muted mt-1 block">Current Fixify policy is 10%</span>
              </div>

              <div>
                <label className="block font-semibold text-primary-navy mb-1">
                  Max Dispatch Radius (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={platformConfig.maxDispatchRadiusKm}
                  onChange={(e) =>
                    setPlatformConfig({ ...platformConfig, maxDispatchRadiusKm: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary-navy font-heading border-b border-border-subtle pb-2">
              Customer Support Hotline Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-primary-navy mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={platformConfig.supportEmail}
                  onChange={(e) =>
                    setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary-navy mb-1">
                  Toll-Free Helpline
                </label>
                <input
                  type="text"
                  value={platformConfig.tollFreeNumber}
                  onChange={(e) =>
                    setPlatformConfig({ ...platformConfig, tollFreeNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-vanilla/40 border border-border-subtle rounded-lg focus:outline-none focus:border-secondary-blue"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-primary-navy font-heading border-b border-border-subtle pb-2">
              Verification Compliance
            </h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.requireAadhaarVerification}
                onChange={(e) =>
                  setPlatformConfig({
                    ...platformConfig,
                    requireAadhaarVerification: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-secondary-blue"
              />
              <span className="font-semibold text-primary-navy">
                Enforce mandatory Aadhaar ID verification before technician can accept customer jobs
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.autoAssignVerifiedOnly}
                onChange={(e) =>
                  setPlatformConfig({
                    ...platformConfig,
                    autoAssignVerifiedOnly: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-secondary-blue"
              />
              <span className="font-semibold text-primary-navy">
                Auto-assign engine only considers 4.8+ rated and verified specialists
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary-navy hover:bg-secondary-blue text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-accent-orange" />
              <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
