import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  ShieldCheck, 
  Sliders, 
  PoundSterling, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AppSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    riskThresholds: { lowMax: 0.25, moderateMax: 0.50, highMax: 0.75 },
    financialAssumptions: { grossMarginPct: 65, averageContactCostGbp: 12.50, defaultIncentiveCostGbp: 45.00, discountRatePct: 5.0 },
    retentionPolicyDays: 730,
    enableGeminiAI: true,
    autoChampionSelection: true
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (e) {
      alert('Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-[#142B4C]" />
            Application Settings, Risk Boundaries & Governance Policy
          </h2>
          <p className="text-xs text-slate-500">
            Configure risk classification boundaries, financial baseline assumptions, and UK GDPR data retention
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settings Persisted</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-[#142B4C]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Churn Risk Probability Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Low Risk Upper Bound: <span className="font-mono text-emerald-700 font-bold">{Math.round(settings.riskThresholds.lowMax * 100)}%</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="0.10"
                max="0.40"
                value={settings.riskThresholds.lowMax}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  riskThresholds: { ...prev.riskThresholds, lowMax: Number(e.target.value) }
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 0.25 (0% to 25%)</span>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Moderate Risk Upper Bound: <span className="font-mono text-amber-700 font-bold">{Math.round(settings.riskThresholds.moderateMax * 100)}%</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="0.30"
                max="0.65"
                value={settings.riskThresholds.moderateMax}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  riskThresholds: { ...prev.riskThresholds, moderateMax: Number(e.target.value) }
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 0.50 (25% to 50%)</span>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                High Risk Upper Bound: <span className="font-mono text-[#8B1E2D] font-bold">{Math.round(settings.riskThresholds.highMax * 100)}%</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="0.60"
                max="0.90"
                value={settings.riskThresholds.highMax}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  riskThresholds: { ...prev.riskThresholds, highMax: Number(e.target.value) }
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">&gt; 75% classified as Critical Risk</span>
            </div>
          </div>
        </div>

        {/* Commercial Financial Assumptions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <PoundSterling className="w-4 h-4 text-[#142B4C]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Commercial Financial Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Baseline Gross Margin (%): <span className="font-mono font-bold text-slate-900">{settings.financialAssumptions.grossMarginPct}%</span>
              </label>
              <input
                type="number"
                min="30"
                max="90"
                value={settings.financialAssumptions.grossMarginPct}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  financialAssumptions: { ...prev.financialAssumptions, grossMarginPct: Number(e.target.value) }
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Average Contact Outreach Cost (£):
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.financialAssumptions.averageContactCostGbp}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  financialAssumptions: { ...prev.financialAssumptions, averageContactCostGbp: Number(e.target.value) }
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Default Incentive Cost (£):
              </label>
              <input
                type="number"
                step="1"
                value={settings.financialAssumptions.defaultIncentiveCostGbp}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  financialAssumptions: { ...prev.financialAssumptions, defaultIncentiveCostGbp: Number(e.target.value) }
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Data Governance & Retention */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-[#142B4C]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Data Retention Policy & UK GDPR Controls
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Customer Data Retention Policy:
              </label>
              <select
                value={settings.retentionPolicyDays}
                onChange={e => setSettings(prev => ({ ...prev, retentionPolicyDays: Number(e.target.value) }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
              >
                <option value={365}>1 Year (365 Days)</option>
                <option value={730}>2 Years (730 Days - Standard UK Telecoms)</option>
                <option value={1095}>3 Years (1,095 Days)</option>
                <option value={1825}>5 Years (Statutory Accounting Limit)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Inactive and archived customer snapshots older than this limit are eligible for automated anonymisation.
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Automatic Model Champion Promotion:
              </label>
              <select
                value={settings.autoChampionSelection ? 'yes' : 'no'}
                onChange={e => setSettings(prev => ({ ...prev, autoChampionSelection: e.target.value === 'yes' }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="yes">Enabled (Promote highest ROC-AUC/F1 model)</option>
                <option value="no">Manual Approval Required</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Requires data scientist confirmation before deploying new champion scoring.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save Settings & Policies'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
