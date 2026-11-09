import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Sliders, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Flame,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CustomerRecord, RiskTier } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { formatGbp, formatPct } from '../../services/calculations';

interface ChurnPredictionViewProps {
  records: CustomerRecord[];
  selectedCustomerId?: string | null;
  onSelectCustomer: (id: string) => void;
  onNavigateToRetention: (customerId: string) => void;
  onRefreshData: () => void;
}

export const ChurnPredictionView: React.FC<ChurnPredictionViewProps> = ({
  records,
  selectedCustomerId,
  onSelectCustomer,
  onNavigateToRetention,
  onRefreshData
}) => {
  const [searchId, setSearchId] = useState(selectedCustomerId || '');
  const [isBulkScoring, setIsBulkScoring] = useState(false);
  const [filterRiskTier, setFilterRiskTier] = useState<string>('All');

  // Simulator state for currently inspected customer
  const [simulatedCsat, setSimulatedCsat] = useState<number | null>(null);
  const [simulatedDirectDebit, setSimulatedDirectDebit] = useState<string | null>(null);
  const [simulatedContract, setSimulatedContract] = useState<string | null>(null);

  // Active records eligible for prospective scoring
  const activeRecords = records.filter(r => r['Churn Flag'] === 0);

  // Currently inspected customer
  const currentCustomer = records.find(r => r['Customer ID'] === searchId) || 
    (selectedCustomerId ? records.find(r => r['Customer ID'] === selectedCustomerId) : activeRecords[0]);

  // Handle What-if simulation
  const baseProb = currentCustomer?.predictedChurnProb || 0.45;
  let simulatedProb = baseProb;

  if (currentCustomer) {
    const csatDelta = (simulatedCsat ?? currentCustomer['Satisfaction Score 1 10']) - currentCustomer['Satisfaction Score 1 10'];
    simulatedProb -= csatDelta * 0.08;

    const dd = simulatedDirectDebit ?? currentCustomer['Direct Debit'];
    if (dd === 'Yes' && currentCustomer['Direct Debit'] === 'No') simulatedProb -= 0.12;
    if (dd === 'No' && currentCustomer['Direct Debit'] === 'Yes') simulatedProb += 0.12;

    const ct = simulatedContract ?? currentCustomer['Contract Type'];
    if (ct.includes('24') && currentCustomer['Contract Type'] === 'Month-to-Month') simulatedProb -= 0.25;
    if (ct === 'Month-to-Month' && currentCustomer['Contract Type'].includes('24')) simulatedProb += 0.25;

    simulatedProb = Math.max(0.02, Math.min(0.98, simulatedProb));
  }

  const handleBulkScore = async () => {
    setIsBulkScoring(true);
    try {
      const res = await fetch('/api/ml/score-all', { method: 'POST' });
      if (res.ok) {
        onRefreshData();
      }
    } catch (e) {
      alert('Error during bulk scoring.');
    } finally {
      setIsBulkScoring(false);
    }
  };

  const exportScoredCsv = () => {
    const exportData = activeRecords.map(r => ({
      'Customer ID': r['Customer ID'],
      'Segment': r['Customer Segment'],
      'Service Type': r['Service Type'],
      'Plan Name': r['Plan Name'],
      'Contract Type': r['Contract Type'],
      'Monthly Charge GBP': r['Monthly Charge GBP'],
      'Predicted Churn Probability': r.predictedChurnProb ? `${Math.round(r.predictedChurnProb * 100)}%` : 'N/A',
      'Assigned Risk Tier': r.riskTier || 'Unscored',
      'CSAT': r['Satisfaction Score 1 10'],
      'Support Complaints': r['Complaints 12M'],
      'Network Outages': r['Network Outages 12M'],
      'Model Version': r.modelVersion || 'v1.4-gb-champion',
      'Scored Timestamp': r.scoredAt || new Date().toISOString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scored_Customers');
    XLSX.writeFile(wb, `BritConnect_Customer_Risk_Scores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredActiveList = activeRecords.filter(r => {
    if (filterRiskTier !== 'All' && r.riskTier !== filterRiskTier) return false;
    return true;
  }).sort((a, b) => (b.predictedChurnProb || 0) - (a.predictedChurnProb || 0));

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#142B4C]" />
            Customer Churn Prediction & Explainability Engine
          </h2>
          <p className="text-xs text-slate-500">
            Model: <span className="font-semibold text-slate-700">Gradient Boosting Champion (v1.4)</span> • Features Audited Against Leakage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkScore}
            disabled={isBulkScoring}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBulkScoring ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Score All {activeRecords.length.toLocaleString()} Active Accounts</span>
          </button>

          <button
            onClick={exportScoredCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Scored List</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Inspector: Left = Customer Profile & SHAP Drivers; Right = What-If Simulator & Prioritised Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Deep Profile & Risk Attribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-5">
            {/* Customer Search Selector */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={e => {
                  setSearchId(e.target.value);
                  const matched = records.find(r => r['Customer ID'].toLowerCase() === e.target.value.toLowerCase().trim());
                  if (matched) onSelectCustomer(matched['Customer ID']);
                }}
                placeholder="Search Customer ID (e.g. BC-1042)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:ring-1 focus:ring-[#142B4C]"
              />
            </div>

            {currentCustomer ? (
              <div className="space-y-4">
                {/* Header Profile Badge */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Customer Profile</div>
                    <div className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2 mt-0.5">
                      {currentCustomer['Customer ID']}
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-sans font-medium">
                        {currentCustomer['Customer Segment']}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {currentCustomer['Plan Name']} • {currentCustomer['City']}, {currentCustomer['UK Nation']}
                    </div>
                  </div>

                  <div className="text-right">
                    <RiskBadge 
                      tier={currentCustomer.riskTier || 'Low'} 
                      prob={currentCustomer.predictedChurnProb} 
                      size="lg" 
                    />
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      MRR: {formatGbp(currentCustomer['Monthly Charge GBP'])}
                    </div>
                  </div>
                </div>

                {/* Account Facts Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Contract Type</span>
                    <span className="font-semibold text-slate-800">{currentCustomer['Contract Type']}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Tenure</span>
                    <span className="font-semibold text-slate-800">{currentCustomer['Tenure Months']} Months</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">CSAT / NPS</span>
                    <span className="font-semibold text-slate-800">{currentCustomer['Satisfaction Score 1 10']}/10 ({currentCustomer['NPS Score']})</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Payment Method</span>
                    <span className="font-semibold text-slate-800">{currentCustomer['Payment Method']} (DD: {currentCustomer['Direct Debit']})</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Support Complaints</span>
                    <span className={`font-semibold ${currentCustomer['Complaints 12M'] > 0 ? 'text-[#8B1E2D]' : 'text-slate-800'}`}>
                      {currentCustomer['Complaints 12M']} Cases (12M)
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Network Outages</span>
                    <span className={`font-semibold ${currentCustomer['Network Outages 12M'] > 1 ? 'text-[#8B1E2D]' : 'text-slate-800'}`}>
                      {currentCustomer['Network Outages 12M']} Events
                    </span>
                  </div>
                </div>

                {/* Explainable AI Risk Drivers (SHAP Attribution) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Key Risk Factors (SHAP Local Attribution)</span>
                    <span className="text-[10px] text-slate-400 normal-case">Marginal &plusmn; Impact</span>
                  </h4>

                  <div className="space-y-2">
                    {currentCustomer.riskDrivers && currentCustomer.riskDrivers.length > 0 ? (
                      currentCustomer.riskDrivers.map((driver, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {driver.direction === 'increases_risk' ? (
                                <TrendingUp className="w-3.5 h-3.5 text-[#8B1E2D]" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              {driver.feature}
                            </span>
                            <span className={`font-mono font-bold ${driver.direction === 'increases_risk' ? 'text-[#8B1E2D]' : 'text-emerald-700'}`}>
                              {driver.direction === 'increases_risk' ? `+${driver.impact}` : `-${driver.impact}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{driver.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-lg">
                        Standard risk distribution. Long tenure cushions propensity.
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action to Retention Strategy */}
                <button
                  onClick={() => onNavigateToRetention(currentCustomer['Customer ID'])}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[#091B33] bg-[#D4AF37] hover:bg-[#b89726] shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#091B33]" />
                  <span>Generate Personalised Retention Strategy</span>
                  <ArrowRight className="w-4 h-4 text-[#091B33]" />
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No customer selected. Type an ID or pick from the table.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: What-If Simulator & Prioritised Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive What-If Simulator */}
          {currentCustomer && (
            <div className="bg-gradient-to-r from-[#091B33] to-[#142B4C] rounded-2xl p-5 text-white border border-[#D4AF37]/30 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    What-If Churn Propensity Simulator
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSimulatedCsat(null);
                    setSimulatedDirectDebit(null);
                    setSimulatedContract(null);
                  }}
                  className="text-[11px] text-slate-300 hover:text-white underline"
                >
                  Reset Parameters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
                {/* 1. CSAT Slider */}
                <div>
                  <label className="text-slate-300 block mb-1">
                    Simulate CSAT: <span className="text-[#D4AF37] font-bold">{simulatedCsat ?? currentCustomer['Satisfaction Score 1 10']}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={simulatedCsat ?? currentCustomer['Satisfaction Score 1 10']}
                    onChange={e => setSimulatedCsat(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                </div>

                {/* 2. Direct Debit Toggle */}
                <div>
                  <label className="text-slate-300 block mb-1">Direct Debit Auto-Pay</label>
                  <select
                    value={simulatedDirectDebit ?? currentCustomer['Direct Debit']}
                    onChange={e => setSimulatedDirectDebit(e.target.value)}
                    className="w-full bg-[#071426] border border-slate-600 rounded px-2.5 py-1 text-xs text-white"
                  >
                    <option value="Yes">Yes (Automated)</option>
                    <option value="No">No (Manual)</option>
                  </select>
                </div>

                {/* 3. Contract Type */}
                <div>
                  <label className="text-slate-300 block mb-1">Contract Term</label>
                  <select
                    value={simulatedContract ?? currentCustomer['Contract Type']}
                    onChange={e => setSimulatedContract(e.target.value)}
                    className="w-full bg-[#071426] border border-slate-600 rounded px-2.5 py-1 text-xs text-white"
                  >
                    <option value="Month-to-Month">Month-to-Month</option>
                    <option value="12 Month Contract">12 Month Contract</option>
                    <option value="24 Month Contract">24 Month Contract</option>
                  </select>
                </div>
              </div>

              {/* Simulation Result Callout */}
              <div className="p-3 bg-[#071426]/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs">Simulated Churn Likelihood:</span>
                  <div className="text-xl font-bold font-mono text-[#D4AF37]">
                    {Math.round(simulatedProb * 100)}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-xs">Baseline Delta:</span>
                  <div className={`text-sm font-bold font-mono ${simulatedProb < baseProb ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulatedProb < baseProb ? `-${Math.round((baseProb - simulatedProb) * 100)}% Risk Reduction` : `+${Math.round((simulatedProb - baseProb) * 100)}% Increased Risk`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prioritised Active Customer Risk Table */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Prioritised Active Customer Scoring Register
                </h3>
                <p className="text-xs text-slate-500">
                  {filteredActiveList.length} accounts ranked by predicted churn risk
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Filter Tier:</span>
                <select
                  value={filterRiskTier}
                  onChange={e => setFilterRiskTier(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700"
                >
                  <option value="All">All Tiers</option>
                  <option value="Critical">Critical Only</option>
                  <option value="High">High Only</option>
                  <option value="Moderate">Moderate Only</option>
                  <option value="Low">Low Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Customer ID</th>
                    <th className="py-2 px-3">Segment</th>
                    <th className="py-2 px-3">Contract</th>
                    <th className="py-2 px-3">MRR</th>
                    <th className="py-2 px-3">Probability</th>
                    <th className="py-2 px-3">Tier</th>
                    <th className="py-2 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActiveList.map(cust => {
                    const isSelected = cust['Customer ID'] === currentCustomer?.['Customer ID'];
                    return (
                      <tr 
                        key={cust['Customer ID']} 
                        onClick={() => onSelectCustomer(cust['Customer ID'])}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-slate-900 font-bold">
                          {cust['Customer ID']}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {cust['Customer Segment']}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {cust['Contract Type']}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">
                          {formatGbp(cust['Monthly Charge GBP'])}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {cust.predictedChurnProb ? `${Math.round(cust.predictedChurnProb * 100)}%` : '35%'}
                        </td>
                        <td className="py-2 px-3">
                          <RiskBadge tier={cust.riskTier} showProb={false} size="sm" />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCustomer(cust['Customer ID']);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
