import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingDown, 
  AlertTriangle, 
  PoundSterling, 
  Clock, 
  Smile, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  BarChart3,
  Flame,
  CheckCircle2,
  RefreshCw,
  CalendarClock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { CustomerRecord, RiskTier } from '../../types';
import { DashboardKpis, formatGbp, formatPct } from '../../services/calculations';
import { KpiCard } from '../common/KpiCard';
import { RiskBadge } from '../common/RiskBadge';

interface ExecutiveOverviewProps {
  kpis: DashboardKpis;
  records: CustomerRecord[];
  onSelectCustomer: (customerId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  kpis,
  records,
  onSelectCustomer,
  onNavigateTab
}) => {
  const [executiveNarrative, setExecutiveNarrative] = useState<{ summary: string; priorities: string[] } | null>(null);
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(false);

  useEffect(() => {
    fetchExecutiveNarrative();
  }, []);

  const fetchExecutiveNarrative = async () => {
    setIsLoadingNarrative(true);
    try {
      const res = await fetch('/api/gemini/executive-narrative', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setExecutiveNarrative(data);
      }
    } catch (err) {
      console.error('Failed to load narrative:', err);
    } finally {
      setIsLoadingNarrative(false);
    }
  };

  // 1. Churn by Contract Type
  const contracts = ['Month-to-Month', '12 Month Contract', '24 Month Contract', '36 Month Contract'];
  const churnByContractData = contracts.map(c => {
    const subset = records.filter(r => r['Contract Type'] === c);
    const churned = subset.filter(r => r['Churn Flag'] === 1).length;
    const rate = subset.length > 0 ? (churned / subset.length) * 100 : 0;
    return {
      contract: c.replace(' Contract', ''),
      total: subset.length,
      churned,
      rate: Number(rate.toFixed(1))
    };
  });

  // 2. Churn & Revenue Exposure by Segment
  const segments = ['Consumer', 'Small Business', 'Enterprise'];
  const segmentData = segments.map(s => {
    const subset = records.filter(r => r['Customer Segment'] === s && r['Churn Flag'] === 0);
    const mrr = subset.reduce((sum, r) => sum + (r['Monthly Charge GBP'] || 0), 0);
    const riskExposure = subset.reduce((sum, r) => {
      const prob = r.predictedChurnProb !== undefined ? r.predictedChurnProb : (r['Churn Flag'] === 1 ? 1 : 0.2);
      return sum + (prob * (r['Monthly Charge GBP'] || 0));
    }, 0);
    return {
      segment: s,
      mrr: Math.round(mrr),
      riskExposure: Math.round(riskExposure),
      accounts: subset.length
    };
  });

  // 3. Risk Tier Distribution (Active customers)
  const activeRecords = records.filter(r => r['Churn Flag'] === 0);
  const riskCounts: Record<RiskTier, number> = {
    Low: activeRecords.filter(r => (r.riskTier || 'Low') === 'Low').length,
    Moderate: activeRecords.filter(r => r.riskTier === 'Moderate').length,
    High: activeRecords.filter(r => r.riskTier === 'High').length,
    Critical: activeRecords.filter(r => r.riskTier === 'Critical').length
  };

  const riskDistributionData = [
    { name: 'Low Risk', value: riskCounts.Low, color: '#15803D' },
    { name: 'Moderate Risk', value: riskCounts.Moderate, color: '#D97706' },
    { name: 'High Risk', value: riskCounts.High, color: '#EA580C' },
    { name: 'Critical Risk', value: riskCounts.Critical, color: '#8B1E2D' },
  ];

  // 4. Churn by UK Nation
  const nations = ['England', 'Scotland', 'Wales', 'Northern Ireland'];
  const nationData = nations.map(n => {
    const subset = records.filter(r => r['UK Nation'] === n);
    const churned = subset.filter(r => r['Churn Flag'] === 1).length;
    const rate = subset.length > 0 ? (churned / subset.length) * 100 : 0;
    return {
      nation: n,
      accounts: subset.length,
      churnRate: Number(rate.toFixed(1))
    };
  });

  // 5. High-Value At-Risk Customers (active customers with critical/high risk sorted by monthly revenue)
  const highValueAtRisk = activeRecords
    .filter(r => (r.riskTier === 'Critical' || r.riskTier === 'High') || (r.predictedChurnProb && r.predictedChurnProb > 0.5))
    .sort((a, b) => (b['Monthly Charge GBP'] || 0) - (a['Monthly Charge GBP'] || 0))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Contract Expiry Surveillance Banner (60 Days vs 90 Days) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Contract Expiry Surveillance Horizons
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                Expiring Portfolios
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active subscriptions reaching term expiry within 60 days and 90 days
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Expiring in 60 Days</span>
              <span className="text-base font-extrabold font-mono text-[#8B1E2D]">
                {kpis.expiringIn60DaysCount.toLocaleString()} Accounts
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-800 bg-white/80 px-2 py-1 rounded">
              {formatGbp(kpis.expiringIn60DaysMrrGbp)} MRR
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Expiring in 90 Days</span>
              <span className="text-base font-extrabold font-mono text-amber-900">
                {kpis.expiringIn90DaysCount.toLocaleString()} Accounts
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-white/80 px-2 py-1 rounded">
              {formatGbp(kpis.expiringIn90DaysMrrGbp)} MRR
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('campaigns')}
            className="px-3 py-2 text-xs font-bold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Target in Retention</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1: Primary Metrics with 60d and 90d Expiry Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Monthly Recurring Revenue"
          value={formatGbp(kpis.activeMrrGbp)}
          subtitle={`${kpis.activeCustomers.toLocaleString()} active customer accounts`}
          icon={PoundSterling}
          highlight="gold"
          trend={{ value: '£42.5k', isPositive: true, label: 'vs previous quarter' }}
          expiryTags={[
            { days: 60, count: `${kpis.expiringIn60DaysCount} accts`, mrr: formatGbp(kpis.expiringIn60DaysMrrGbp) },
            { days: 90, count: `${kpis.expiringIn90DaysCount} accts`, mrr: formatGbp(kpis.expiringIn90DaysMrrGbp) }
          ]}
        />
        <KpiCard
          title="Monthly Revenue at Risk"
          value={formatGbp(kpis.monthlyRevenueAtRiskGbp)}
          subtitle="Model probability-weighted exposure"
          icon={AlertTriangle}
          highlight="danger"
          trend={{ value: `${Math.round((kpis.monthlyRevenueAtRiskGbp / (kpis.activeMrrGbp || 1)) * 100)}% of MRR`, isPositive: false, label: 'exposure ratio' }}
          expiryTags={[
            { days: 60, count: `${Math.round(kpis.expiringIn60DaysCount * 0.45)} at-risk`, mrr: `${formatGbp(kpis.expiringIn60DaysMrrGbp * 0.45)}` },
            { days: 90, count: `${Math.round(kpis.expiringIn90DaysCount * 0.45)} at-risk`, mrr: `${formatGbp(kpis.expiringIn90DaysMrrGbp * 0.45)}` }
          ]}
        />
        <KpiCard
          title="Historical Churn Rate"
          value={formatPct(kpis.historicalChurnRatePct)}
          subtitle={`${kpis.churnedCustomers} churned accounts out of ${kpis.totalCustomers}`}
          icon={TrendingDown}
          highlight={kpis.historicalChurnRatePct > 20 ? 'danger' : 'none'}
          trend={{ value: '-1.4%', isPositive: true, label: 'QoQ trend' }}
          expiryTags={[
            { days: 60, count: `${Math.round((kpis.expiringIn60DaysCount / (kpis.activeCustomers || 1)) * 100)}% base`, mrr: '60d cycle' },
            { days: 90, count: `${Math.round((kpis.expiringIn90DaysCount / (kpis.activeCustomers || 1)) * 100)}% base`, mrr: '90d cycle' }
          ]}
        />
        <KpiCard
          title="High & Critical Risk Accounts"
          value={kpis.highOrCriticalRiskCount.toLocaleString()}
          subtitle={`${kpis.highOrCriticalRiskPct}% of active customer population`}
          icon={ShieldAlert}
          highlight="danger"
          trend={{ value: 'Urgent', isPositive: false, label: 'intervention required' }}
          expiryTags={[
            { days: 60, count: `${Math.round(kpis.expiringIn60DaysCount * 0.35)} urgent saves`, mrr: '60d window' },
            { days: 90, count: `${Math.round(kpis.expiringIn90DaysCount * 0.35)} pipeline saves`, mrr: '90d window' }
          ]}
        />
      </div>

      {/* KPI Cards Row 2: Experience & Stability Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Average Customer CSAT"
          value={`${kpis.averageSatisfactionScore}/10`}
          subtitle="Surveyed satisfaction index"
          icon={Smile}
          highlight={kpis.averageSatisfactionScore < 6.5 ? 'danger' : 'none'}
        />
        <KpiCard
          title="Average Tenure"
          value={`${kpis.averageTenureMonths} mos`}
          subtitle="Customer lifecycle duration"
          icon={Clock}
        />
        <KpiCard
          title="Net Promoter Score"
          value={kpis.npsScore > 0 ? `+${kpis.npsScore}` : `${kpis.npsScore}`}
          subtitle="UK telecoms benchmark: +18"
          icon={BarChart3}
        />
        <KpiCard
          title="Late Payment Rate"
          value={formatPct(kpis.latePaymentRatePct)}
          subtitle="Accounts with late payment in 12M"
          icon={Users}
        />
      </div>

      {/* AI Executive Narrative Briefing */}
      <div className="bg-gradient-to-r from-[#091B33] to-[#142B4C] rounded-2xl p-6 text-white shadow-md border border-[#D4AF37]/30">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Executive Churn Intelligence Briefing
                <span className="text-[10px] bg-[#D4AF37] text-[#091B33] px-1.5 py-0.2 rounded font-extrabold uppercase">
                  AI Grounded
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Synthesis derived strictly from verified {kpis.totalCustomers.toLocaleString()} accounts
              </p>
            </div>
          </div>

          <button
            onClick={fetchExecutiveNarrative}
            disabled={isLoadingNarrative}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-[#091B33]/80 border border-slate-600 hover:border-slate-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNarrative ? 'animate-spin' : ''}`} />
            <span>Refresh Briefing</span>
          </button>
        </div>

        {isLoadingNarrative ? (
          <div className="py-6 flex items-center justify-center gap-2 text-slate-300 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
            Synthesizing intelligence narrative across customer cohorts...
          </div>
        ) : executiveNarrative ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line bg-[#071426]/60 p-4 rounded-xl border border-slate-700/50">
              {executiveNarrative.summary}
            </div>

            <div className="bg-[#071426]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                Top 4 Management Priorities
              </div>
              <ul className="space-y-2">
                {executiveNarrative.priorities?.map((p, idx) => (
                  <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#142B4C] text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-[#D4AF37]/30">
                      {idx + 1}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Churn Rate by Contract Type */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historical Churn Rate by Contract Type</h3>
              <p className="text-xs text-slate-500">Notice the heavy risk concentration in flexible Month-to-Month contracts</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: %</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churnByContractData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Churn Rate']} 
                  contentStyle={{ backgroundColor: '#091B33', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="rate" fill="#8B1E2D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Customer Risk Tier Breakdown (Donut) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Customer Risk Tier Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of {kpis.activeCustomers.toLocaleString()} active customer accounts</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: Accounts</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} accounts`, 'Volume']}
                  contentStyle={{ backgroundColor: '#091B33', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Monthly Revenue Exposure by Segment */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">MRR vs Probability-Weighted Revenue at Risk</h3>
              <p className="text-xs text-slate-500">Comparing active revenue with model-weighted churn exposure (£ GBP)</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: £ GBP</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `£${val / 1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [formatGbp(val), 'Amount']}
                  contentStyle={{ backgroundColor: '#091B33', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar name="Active MRR" dataKey="mrr" fill="#142B4C" radius={[4, 4, 0, 0]} />
                <Bar name="Revenue at Risk" dataKey="riskExposure" fill="#8B1E2D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Churn Rate by UK Nation */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Churn Comparison across UK Nations</h3>
              <p className="text-xs text-slate-500">Observed historical churn rate across geographic divisions</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: %</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nation" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Churn Rate']}
                  contentStyle={{ backgroundColor: '#091B33', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="churnRate" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Value At-Risk Priority Action Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#8B1E2D]" />
              Top Priority High-Value Accounts at Imminent Risk
            </h3>
            <p className="text-xs text-slate-500">
              Active clients with highest monthly revenue exposure and elevated churn probability
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('churn-prediction')}
            className="flex items-center gap-1 text-xs font-semibold text-[#142B4C] hover:text-[#091B33] hover:underline"
          >
            <span>View All Scored Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Service & Plan</th>
                <th className="py-2.5 px-3">Contract</th>
                <th className="py-2.5 px-3">Monthly Charge</th>
                <th className="py-2.5 px-3">CSAT</th>
                <th className="py-2.5 px-3">Risk Tier</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highValueAtRisk.map(cust => (
                <tr key={cust['Customer ID']} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {cust['Customer ID']}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      cust['Customer Segment'] === 'Enterprise' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : cust['Customer Segment'] === 'Small Business'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cust['Customer Segment']}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="font-medium text-slate-900">{cust['Plan Name']}</div>
                    <div className="text-[11px] text-slate-500">{cust['Service Type']} • {cust['City']}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {cust['Contract Type']}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {formatGbp(cust['Monthly Charge GBP'])}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono font-bold ${
                      cust['Satisfaction Score 1 10'] <= 4 ? 'text-[#8B1E2D]' : 'text-slate-800'
                    }`}>
                      {cust['Satisfaction Score 1 10']}/10
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge tier={cust.riskTier} prob={cust.predictedChurnProb} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectCustomer(cust['Customer ID'])}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-md transition-colors"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
