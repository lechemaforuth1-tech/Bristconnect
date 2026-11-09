import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ShieldCheck, 
  Calculator, 
  Lock, 
  HelpCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BRITCONNECT_COLUMNS } from '../../services/schema';

export const HelpDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'formulas' | 'gdpr'>('dictionary');
  const [search, setSearch] = useState('');

  const filteredColumns = BRITCONNECT_COLUMNS.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.dataType.toLowerCase().includes(q);
  });

  const exportDictionaryExcel = () => {
    const data = BRITCONNECT_COLUMNS.map(c => ({
      'Field Number': c.no,
      'Field Name': c.name,
      'Data Type': c.dataType,
      'Description': c.description,
      'Required': c.isRequired ? 'Yes' : 'No',
      'Eligible Predictor': c.isPredictiveEligible ? 'Yes' : 'No (Shielded)',
      'Leakage Assessment': c.leakageRisk,
      'Aliases': c.aliases.join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BritConnect_Dictionary');
    XLSX.writeFile(wb, 'BritConnect_Canonical_Data_Dictionary.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#142B4C]" />
            Documentation, Canonical Data Dictionary & Governance Standards
          </h2>
          <p className="text-xs text-slate-500">
            Technical specifications, calculation formulas, target leakage audit rules, and UK GDPR compliance guidelines
          </p>
        </div>

        <button
          onClick={exportDictionaryExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>Export Data Dictionary</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'dictionary', label: 'Canonical 38-Field Data Dictionary' },
          { id: 'formulas', label: 'Central Financial & Analytical Formulas' },
          { id: 'gdpr', label: 'UK GDPR & Compliance Governance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-[#142B4C] text-[#142B4C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Data Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search canonical fields or descriptions..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Showing {filteredColumns.length} of {BRITCONNECT_COLUMNS.length} fields
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No.</th>
                  <th className="py-2.5 px-3">Canonical Field Name</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">ML Status</th>
                  <th className="py-2.5 px-3">Leakage Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredColumns.map(col => (
                  <tr key={col.no} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400 font-bold">{col.no}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{col.name}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{col.dataType}</td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs">{col.description}</td>
                    <td className="py-2 px-3">
                      {col.isPredictiveEligible ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">Eligible Predictor</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Shielded / Excluded</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        col.leakageRisk === 'Target' 
                          ? 'bg-rose-100 text-[#8B1E2D]'
                          : col.leakageRisk === 'Post-Outcome'
                          ? 'bg-amber-100 text-amber-900'
                          : col.leakageRisk === 'Outcome-Derived'
                          ? 'bg-orange-100 text-orange-900'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {col.leakageRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Central Calculation Formulas */}
      {activeTab === 'formulas' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="space-y-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">1. Historical Customer Churn Rate</h3>
              <div className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-semibold">
                Churn Rate (%) = (Churned Customers / Eligible Customer Population) &times; 100
              </div>
              <p className="text-slate-600">
                Calculated on active confirmed customer population. Churned status is strictly verified by reconciling Churn Flag = 1 and Churn Status = 'Churned'.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Active Monthly Recurring Revenue (MRR)</h3>
              <div className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-semibold">
                Active MRR (£) = &Sigma; Monthly Charge GBP (for all active customers with Churn Flag = 0)
              </div>
              <p className="text-slate-600">
                Excludes cancelled subscriptions to prevent double-counting historical revenue in current operational cash flow.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">3. Probability-Weighted Monthly Revenue at Risk</h3>
              <div className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-semibold">
                Expected Monthly Revenue Exposure (£) = &Sigma; (Predicted Churn Probability &times; Monthly Charge GBP)
              </div>
              <p className="text-slate-600">
                Represents model-weighted financial exposure. Derived from deployed champion machine learning model (e.g. Gradient Boosting v1.4).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">4. Retention Campaign Net Financial Benefit & ROI</h3>
              <div className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-semibold">
                Net Benefit (£) = (Incremental Retained Customers &times; Monthly Revenue &times; Horizon Months &times; Gross Margin %) &minus; Total Campaign Cost (£)
              </div>
              <p className="text-slate-600">
                Calculated conservatively after deducting all outbound contact expenses and incentive bonuses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: UK GDPR Governance */}
      {activeTab === 'gdpr' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Lock className="w-5 h-5 text-[#142B4C]" />
            <h3 className="text-sm font-bold text-slate-900">
              UK General Data Protection Regulation (UK GDPR) & Data Protection Act 2018 Compliance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Data Minimisation & Purpose Limitation</h4>
              <p className="text-slate-600">
                The platform processes only telecommunications performance, billing, and technical service metrics necessary for contractual execution and churn mitigation. Protected demographic characteristics are excluded from automated model scoring.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Human Oversight of Automated Decisions</h4>
              <p className="text-slate-600">
                In compliance with Article 22 of UK GDPR, machine learning predictions inform risk prioritization but do not automatically terminate contracts, alter pricing terms, or execute consequential actions without human retention manager approval.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Right to Erasure & Data Subject Requests</h4>
              <p className="text-slate-600">
                When a customer erasure request is received, administrators can invoke dataset re-ingestion with excluded records. Cleaned analytical snapshots reflect updated customer consent records immediately.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Auditability & Accountability</h4>
              <p className="text-slate-600">
                All data transformations, machine learning training runs, and campaign exports are recorded in immutable, timestamped audit logs accessible to compliance officers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
