import React, { useState } from 'react';
import { 
  PoundSterling, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  BarChart3, 
  Coins, 
  Target,
  Sparkles,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { CustomerRecord } from '../../types';
import { 
  DashboardKpis, 
  formatGbp, 
  formatPct, 
  calculateRetentionScenario, 
  ScenarioInputs 
} from '../../services/calculations';

interface RevenueIntelligenceViewProps {
  kpis: DashboardKpis;
  records: CustomerRecord[];
}

export const RevenueIntelligenceView: React.FC<RevenueIntelligenceViewProps> = ({
  kpis,
  records
}) => {
  const activeRecords = records.filter(r => r['Churn Flag'] === 0);
  const avgMonthly = kpis.averageMonthlyChargeGbp || 45.0;

  // Scenario Calculator Inputs State
  const [scenarioInputs, setScenarioInputs] = useState<ScenarioInputs>({
    targetCustomerCount: 200,
    averageMonthlyRevenueGbp: avgMonthly,
    contactCostGbp: 12.50,
    incentiveCostGbp: 40.00,
    takeUpRatePct: 65,
    incrementalEffectivenessPct: 22,
    horizonMonths: 12,
    grossMarginPct: 65
  });

  const scenarioResults = calculateRetentionScenario(scenarioInputs);

  // Revenue by Service Tier
  const serviceBreakdown = ['Fibre Broadband', 'Mobile 5G', 'Triple Play', 'Quad Play', 'Landline & Broadband'].map(srv => {
    const subset = activeRecords.filter(r => r['Service Type'] === srv);
    const mrr = subset.reduce((sum, r) => sum + (r['Monthly Charge GBP'] || 0), 0);
    const atRisk = subset.reduce((sum, r) => {
      const p = r.predictedChurnProb !== undefined ? r.predictedChurnProb : 0.2;
      return sum + (p * (r['Monthly Charge GBP'] || 0));
    }, 0);
    return {
      service: srv,
      mrr: Math.round(mrr),
      atRisk: Math.round(atRisk),
      accounts: subset.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border-l-4 border-l-[#D4AF37] border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Monthly Recurring Revenue</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{formatGbp(kpis.activeMrrGbp)}</div>
            <p className="text-xs text-slate-500 mt-1">Annualised: {formatGbp(kpis.activeMrrGbp * 12)}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] bg-rose-50 text-[#8B1E2D] border border-rose-200 font-medium">
              <span className="font-bold">60 Days:</span> {kpis.expiringIn60DaysCount} accts ({formatGbp(kpis.expiringIn60DaysMrrGbp)})
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-medium">
              <span className="font-bold">90 Days:</span> {kpis.expiringIn90DaysCount} accts ({formatGbp(kpis.expiringIn90DaysMrrGbp)})
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-l-[#8B1E2D] border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Revenue at Risk</div>
            <div className="text-2xl font-bold font-mono text-[#8B1E2D] mt-1">{formatGbp(kpis.monthlyRevenueAtRiskGbp)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {formatPct((kpis.monthlyRevenueAtRiskGbp / (kpis.activeMrrGbp || 1)) * 100)} of portfolio MRR
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] bg-rose-50 text-[#8B1E2D] border border-rose-200 font-medium">
              <span className="font-bold">60d Risk:</span> {formatGbp(kpis.expiringIn60DaysMrrGbp * 0.45)}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-medium">
              <span className="font-bold">90d Risk:</span> {formatGbp(kpis.expiringIn90DaysMrrGbp * 0.45)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-l-[#142B4C] border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Monthly Charge (ARPU)</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{formatGbp(kpis.averageMonthlyChargeGbp, 2)}</div>
          <p className="text-xs text-slate-500 mt-1">Across all subscribed services</p>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-l-emerald-600 border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumulative Realised Lifetime Value</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{formatGbp(kpis.totalLifetimeRevenueGbp)}</div>
          <p className="text-xs text-slate-500 mt-1">Total revenue collected to date</p>
        </div>
      </div>

      {/* Interactive Financial Retention Scenario Calculator */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#142B4C]" />
              Interactive Commercial Retention Scenario Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Model campaign costs, incremental retention effectiveness, net contribution, and Return on Investment (ROI)
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-800 rounded-md border border-blue-200">
            Scenario Evaluation Mode
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Campaign & Commercial Assumptions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Targeted Customers: <span className="font-mono font-bold text-slate-900">{scenarioInputs.targetCustomerCount}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={scenarioInputs.targetCustomerCount}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, targetCustomerCount: Number(e.target.value) }))}
                  className="w-full accent-[#142B4C]"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Average Monthly Revenue: <span className="font-mono font-bold text-slate-900">£{scenarioInputs.averageMonthlyRevenueGbp}</span>
                </label>
                <input
                  type="number"
                  value={scenarioInputs.averageMonthlyRevenueGbp}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, averageMonthlyRevenueGbp: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Contact Outreach Cost: <span className="font-mono font-bold text-slate-900">£{scenarioInputs.contactCostGbp.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={scenarioInputs.contactCostGbp}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, contactCostGbp: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Incentive Cost (per Save): <span className="font-mono font-bold text-slate-900">£{scenarioInputs.incentiveCostGbp.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={scenarioInputs.incentiveCostGbp}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, incentiveCostGbp: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Offer Take-Up Rate: <span className="font-mono font-bold text-slate-900">{scenarioInputs.takeUpRatePct}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={scenarioInputs.takeUpRatePct}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, takeUpRatePct: Number(e.target.value) }))}
                  className="w-full accent-[#142B4C]"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Incremental Save Uplift: <span className="font-mono font-bold text-slate-900">{scenarioInputs.incrementalEffectivenessPct}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={scenarioInputs.incrementalEffectivenessPct}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, incrementalEffectivenessPct: Number(e.target.value) }))}
                  className="w-full accent-[#142B4C]"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Evaluation Horizon: <span className="font-mono font-bold text-slate-900">{scenarioInputs.horizonMonths} Months</span>
                </label>
                <select
                  value={scenarioInputs.horizonMonths}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, horizonMonths: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded"
                >
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Telecom Gross Margin: <span className="font-mono font-bold text-slate-900">{scenarioInputs.grossMarginPct}%</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="85"
                  value={scenarioInputs.grossMarginPct}
                  onChange={e => setScenarioInputs(prev => ({ ...prev, grossMarginPct: Number(e.target.value) }))}
                  className="w-full accent-[#142B4C]"
                />
              </div>
            </div>
          </div>

          {/* Results Output Column (6 cols) */}
          <div className="lg:col-span-6 bg-gradient-to-tr from-[#091B33] to-[#142B4C] rounded-2xl p-6 text-white flex flex-col justify-between border border-[#D4AF37]/30 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Scenario Projected Outcomes
                </span>
                <span className="text-[10px] bg-[#D4AF37] text-[#091B33] px-2 py-0.5 rounded font-extrabold">
                  ROI: {scenarioResults.roiPct}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-[#071426]/70 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Campaign Cost</span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5">
                    {formatGbp(scenarioResults.totalCampaignCostGbp)}
                  </span>
                </div>

                <div className="p-3 bg-[#071426]/70 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Incremental Accounts Saved</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {scenarioResults.expectedIncrementalRetained} Accounts
                  </span>
                </div>

                <div className="p-3 bg-[#071426]/70 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Gross Retained Revenue</span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5">
                    {formatGbp(scenarioResults.grossRetainedRevenueGbp)}
                  </span>
                </div>

                <div className="p-3 bg-[#071426]/70 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Gross Retained Margin</span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5">
                    {formatGbp(scenarioResults.grossRetainedMarginGbp)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl">
                <div className="text-xs text-emerald-300 font-semibold uppercase">Net Commercial Financial Benefit</div>
                <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                  {formatGbp(scenarioResults.netFinancialBenefitGbp)}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  After fully deducting contact outreach costs (£{scenarioInputs.contactCostGbp}/acct) and incentive bonuses (£{scenarioInputs.incentiveCostGbp}/save).
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>Labelled as scenario model projections. Final realized effectiveness is confirmed via post-campaign A/B control testing.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Service Type Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active MRR vs Model Revenue at Risk by Telecommunications Service
            </h3>
            <p className="text-xs text-slate-500">Comparing portfolio subscription volume against churn vulnerability</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Unit: £ GBP</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="service" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `£${val / 1000}k`} />
              <Tooltip 
                formatter={(val: any) => [formatGbp(val), 'Amount']}
                contentStyle={{ backgroundColor: '#091B33', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar name="Active MRR" dataKey="mrr" fill="#142B4C" radius={[4, 4, 0, 0]} />
              <Bar name="Revenue at Risk" dataKey="atRisk" fill="#8B1E2D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
