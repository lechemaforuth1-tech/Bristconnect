import React, { useState } from 'react';
import { 
  Users, 
  Flame, 
  Award, 
  UserPlus, 
  Tag, 
  Frown, 
  CreditCard, 
  CalendarClock, 
  Anchor,
  Download,
  Megaphone,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CustomerRecord } from '../../types';
import { formatGbp, formatPct } from '../../services/calculations';

interface CustomerSegmentationViewProps {
  records: CustomerRecord[];
  onTargetSegmentInCampaign: (segmentName: string) => void;
  onFilterBySegment: (segmentName: string) => void;
}

export const CustomerSegmentationView: React.FC<CustomerSegmentationViewProps> = ({
  records,
  onTargetSegmentInCampaign,
  onFilterBySegment
}) => {
  const activeRecords = records.filter(r => r['Churn Flag'] === 0);
  const totalActive = activeRecords.length || 1;

  // Segment 1: High-Value, High-Risk
  const segHighValHighRisk = activeRecords.filter(r => 
    (r['Customer Segment'] === 'Enterprise' || (r['Monthly Charge GBP'] || 0) >= 65) &&
    ((r.predictedChurnProb || 0) >= 0.50 || r.riskTier === 'High' || r.riskTier === 'Critical')
  );

  // Segment 2: High-Value Loyal
  const segHighValLoyal = activeRecords.filter(r =>
    (r['Customer Segment'] === 'Enterprise' || (r['Monthly Charge GBP'] || 0) >= 65) &&
    ((r.predictedChurnProb || 0) < 0.25 || r.riskTier === 'Low')
  );

  // Segment 3: New Customers with Elevated Risk
  const segNewRisk = activeRecords.filter(r =>
    (r['Tenure Months'] || 0) <= 6 &&
    ((r['Complaints 12M'] || 0) > 0 || (r['Network Outages 12M'] || 0) > 0 || (r.predictedChurnProb || 0) > 0.4)
  );

  // Segment 4: Service-Dissatisfied
  const segDissatisfied = activeRecords.filter(r =>
    (r['Satisfaction Score 1 10'] || 7) <= 5 ||
    (r['Complaints 12M'] || 0) >= 1 ||
    (r['Network Outages 12M'] || 0) >= 2
  );

  // Segment 5: Payment Friction
  const segPaymentFriction = activeRecords.filter(r =>
    (r['Late Payments 12M'] || 0) > 0 ||
    (r['Failed Payments 12M'] || 0) > 0 ||
    r['Direct Debit'] === 'No'
  );

  // Segment 6: Contract Expiry Proximity
  const segContractExpiry = activeRecords.filter(r =>
    r['Contract Type'] === 'Month-to-Month' || r['Auto Renew'] === 'No'
  );

  // Segment 7: Stable Long-Tenure
  const segStableTenure = activeRecords.filter(r =>
    (r['Tenure Months'] || 0) >= 24 &&
    (r['Satisfaction Score 1 10'] || 7) >= 7 &&
    (r['Complaints 12M'] || 0) === 0
  );

  const commercialSegments = [
    {
      id: 'high-val-high-risk',
      name: 'High-Value, High-Risk Clients',
      icon: Flame,
      color: 'border-l-[#8B1E2D]',
      records: segHighValHighRisk,
      description: 'Enterprise & premium accounts with Monthly Charge > £65 exhibiting severe churn indicators.',
      primaryDriver: 'Service disruption & contract flexibility without auto-renew',
      strategy: 'Deploy dedicated senior account manager + complimentary Wi-Fi 6 hardware upgrade.'
    },
    {
      id: 'high-val-loyal',
      name: 'High-Value Loyal Advocates',
      icon: Award,
      color: 'border-l-[#D4AF37]',
      records: segHighValLoyal,
      description: 'Top revenue contributors with extended tenure, high CSAT, and minimal churn risk.',
      primaryDriver: 'Established reliability, long-term multi-play adoption',
      strategy: 'Enroll in BritConnect VIP Executive Club, provide early access to 5G Standalone speed tiers.'
    },
    {
      id: 'service-dissatisfied',
      name: 'Service-Dissatisfied Accounts',
      icon: Frown,
      color: 'border-l-rose-600',
      records: segDissatisfied,
      description: 'Customers impacted by repeat network outages, open complaints, or low CSAT scores (≤5).',
      primaryDriver: 'Network downtime & unresolved customer service ticket escalation',
      strategy: 'Prioritised engineering dispatch, service credit compensation, and post-resolution CSAT check.'
    },
    {
      id: 'payment-friction',
      name: 'Payment Friction & Delinquency',
      icon: CreditCard,
      color: 'border-l-amber-600',
      records: segPaymentFriction,
      description: 'Accounts with manual payment methods, late payments, or failed direct debit attempts.',
      primaryDriver: 'Manual billing inconvenience, card expiration, payment processing friction',
      strategy: 'Offer £10 bill credit incentive for migrating to automated Direct Debit.'
    },
    {
      id: 'contract-expiry',
      name: 'Month-to-Month Contract Exposure',
      icon: CalendarClock,
      color: 'border-l-blue-600',
      records: segContractExpiry,
      description: 'Subscribers operating without fixed commitments, susceptible to immediate competitor poaching.',
      primaryDriver: 'Competitor price aggression and lack of contractual commitment',
      strategy: 'Launch 24-month fixed price guarantee campaign with 20% renewal discount.'
    },
    {
      id: 'stable-tenure',
      name: 'Stable Long-Tenure Cohort',
      icon: Anchor,
      color: 'border-l-emerald-600',
      records: segStableTenure,
      description: 'Loyal base (tenure > 24m) with high satisfaction and consistent payment history.',
      primaryDriver: 'Satisfied baseline, low support ticket load',
      strategy: 'Annual loyalty reward message and optional speed tier upgrade without price increase.'
    }
  ];

  const exportSegmentsExcel = () => {
    const summaryRows = commercialSegments.map(seg => {
      const mrr = seg.records.reduce((sum, r) => sum + (r['Monthly Charge GBP'] || 0), 0);
      const riskExp = seg.records.reduce((sum, r) => sum + ((r.predictedChurnProb || 0.2) * (r['Monthly Charge GBP'] || 0)), 0);
      const avgSat = seg.records.reduce((sum, r) => sum + (r['Satisfaction Score 1 10'] || 0), 0) / (seg.records.length || 1);

      return {
        'Segment Name': seg.name,
        'Active Accounts': seg.records.length,
        'Share of Active Population': formatPct((seg.records.length / totalActive) * 100),
        'Active MRR GBP': Math.round(mrr),
        'Monthly Revenue Exposure GBP': Math.round(riskExp),
        'Average CSAT (1-10)': Number(avgSat.toFixed(1)),
        'Recommended Strategy': seg.strategy
      };
    });

    const ws = XLSX.utils.json_to_sheet(summaryRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commercial_Segments');
    XLSX.writeFile(wb, `BritConnect_Customer_Segments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#142B4C]" />
            Strategic Customer Segmentation Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Categorising {totalActive.toLocaleString()} active customer accounts into actionable commercial retention cohorts
          </p>
        </div>

        <button
          onClick={exportSegmentsExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Segments (Excel)</span>
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {commercialSegments.map(seg => {
          const Icon = seg.icon;
          const count = seg.records.length;
          const pct = ((count / totalActive) * 100);
          const mrr = seg.records.reduce((sum, r) => sum + (r['Monthly Charge GBP'] || 0), 0);
          const riskExp = seg.records.reduce((sum, r) => sum + ((r.predictedChurnProb || 0.25) * (r['Monthly Charge GBP'] || 0)), 0);
          const avgCsat = seg.records.reduce((sum, r) => sum + (r['Satisfaction Score 1 10'] || 0), 0) / (count || 1);

          return (
            <div
              key={seg.id}
              className={`bg-white rounded-xl p-5 border border-slate-200 border-l-4 ${seg.color} shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-[#142B4C]" />
                    {seg.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {formatPct(pct)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {seg.description}
                </p>

                {/* Segment Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Accounts</span>
                    <span className="text-sm font-bold font-mono text-slate-900">{count.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">MRR</span>
                    <span className="text-sm font-bold font-mono text-slate-900">{formatGbp(mrr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">At-Risk MRR</span>
                    <span className="text-sm font-bold font-mono text-[#8B1E2D]">{formatGbp(riskExp)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div>
                    <span className="font-semibold text-slate-700">Primary Risk Driver: </span>
                    <span className="text-slate-500">{seg.primaryDriver}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Recommended Intervention: </span>
                    <span className="text-slate-500">{seg.strategy}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onTargetSegmentInCampaign(seg.name)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#142B4C] hover:text-[#091B33] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Target in Campaign</span>
                </button>

                <button
                  onClick={() => onFilterBySegment(seg.name)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  <span>Filter View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
