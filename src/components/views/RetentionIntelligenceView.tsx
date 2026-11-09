import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  Layers, 
  Search, 
  Filter, 
  PoundSterling,
  Check,
  X,
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { CustomerRecord, RetentionRecommendation } from '../../types';
import { formatGbp } from '../../services/calculations';

interface RetentionIntelligenceViewProps {
  records: CustomerRecord[];
  selectedCustomerId?: string | null;
  onSelectCustomer: (id: string) => void;
  onLaunchCampaignForRecommendation?: (rec: RetentionRecommendation) => void;
}

export const RetentionIntelligenceView: React.FC<RetentionIntelligenceViewProps> = ({
  records,
  selectedCustomerId,
  onSelectCustomer,
  onLaunchCampaignForRecommendation
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterTeam, setFilterTeam] = useState<string>('All');
  const [activeCustomerSearch, setActiveCustomerSearch] = useState(selectedCustomerId || '');

  // Pre-configured evidence-based actionable recommendations
  const [recommendations, setRecommendations] = useState<RetentionRecommendation[]>([
    {
      id: 'REC-01',
      title: 'Proactive VIP Network Stability Care & Hardware Upgrade',
      targetCustomerOrSegment: 'Enterprise & Small Business High-Exposure Accounts',
      priority: 'Critical',
      responsibleTeam: 'Technical Support',
      suggestedTimeline: 'Execute within 48 Hours',
      estimatedCostGbp: 85.00,
      expectedBusinessImpact: 'Reduce high-value churn propensity from 74% to <20%, protecting £14,500 monthly recurring revenue.',
      riskDiagnosis: 'Identified accounts have experienced ≥2 network outages and unresolved support tickets in the past 60 days, driving critical churn probability.',
      businessObjective: 'Restore line stability, eliminate recurring downtime, and rebuild executive client confidence.',
      recommendedAction: 'Dispatch senior network field engineer for direct premises line check and replace legacy router with enterprise Wi-Fi 6 gateway at zero charge.',
      implementationSteps: [
        '1. Priority Technical Review: Network ops manager reviews error-rate telemetry on local cabinet.',
        '2. Concierge Client Contact: Dedicated account manager calls client lead to acknowledge recent disruption.',
        '3. Field Engineer Dispatch: Schedule priority on-site hardware upgrade within 48 hours.',
        '4. Service Credit Application: Apply approved 1-month £50 goodwill billing credit.',
        '5. Post-Resolution Verification: Follow up via automated CSAT SMS 7 days post-deployment.'
      ],
      measurableKpis: [
        'Network complaint recurrence rate (<5%)',
        '30-day post-resolution CSAT improvement (target ≥8.5/10)',
        'Quarterly contract renewal rate (target ≥90%)'
      ],
      measurementApproach: 'Compare 90-day retention outcomes of dispatched cohort against non-intervened control accounts.',
      supportingEvidence: [
        'Network Outages 12M ≥ 2 recorded in canonical database',
        'Average Resolution Hours > 32 hrs',
        'Satisfaction Score 1-10 recorded ≤ 4'
      ],
      status: 'Approved'
    },
    {
      id: 'REC-02',
      title: 'Fixed-Price Renewal Intercept with 20% Retention Discount',
      targetCustomerOrSegment: 'Month-to-Month Contract Subscribers Approaching Churn',
      priority: 'High',
      responsibleTeam: 'Retention',
      suggestedTimeline: 'Initiate 5-Day Email & SMS Sequence',
      estimatedCostGbp: 42.00,
      expectedBusinessImpact: 'Convert flexible month-to-month subscribers into 24-month commitments, cutting annual churn exposure by 62%.',
      riskDiagnosis: 'Subscribers operating without contract commitments have 3.4x higher churn rate and frequently cite rival promotions.',
      businessObjective: 'Lock in predictable recurring revenue and prevent migration to competitors.',
      recommendedAction: 'Offer an exclusive 24-month contract renewal package featuring a guaranteed 20% discount and fixed-price pledge.',
      implementationSteps: [
        '1. Audience Segmentation: Query active accounts on Month-to-Month contracts with tenure > 6 months.',
        '2. Automated Offer Delivery: Send personalized email featuring 24-month price guarantee.',
        '3. Single-Click Acceptance: Enable instant digital renewal via BritConnect mobile app or web portal.',
        '4. Outbound Telesales Follow-up: For accounts with Monthly Charge > £60 un-opened after 72 hours, assign telesales agent.',
        '5. Confirmation & Welcome: Trigger immediate confirmation with updated direct debit schedule.'
      ],
      measurableKpis: [
        'Offer conversion rate (target ≥45%)',
        'Contract duration extension (+24 months)',
        'Net retained revenue (target £38,000)'
      ],
      measurementApproach: 'Track 12-month retention survival curve of renewed subscribers vs month-to-month baseline.',
      supportingEvidence: [
        'Contract Type: Month-to-Month recorded',
        'Competitor Offer Received: Yes flag active',
        'Auto Renew: No'
      ],
      status: 'Pending Review'
    },
    {
      id: 'REC-03',
      title: 'Automated Direct Debit Migration with Bill Credit Incentive',
      targetCustomerOrSegment: 'Subscribers with Failed / Late Payment Friction',
      priority: 'High',
      responsibleTeam: 'Billing',
      suggestedTimeline: 'Within Current Billing Cycle',
      estimatedCostGbp: 15.00,
      expectedBusinessImpact: 'Prevent involuntary billing churn and reduce accounts receivable collection costs by £8,200 annually.',
      riskDiagnosis: 'Manual payment methods (Bank Transfer, Credit Card) correlate with repeated late fees and involuntary cancellation.',
      businessObjective: 'Streamline recurring payment collection and eliminate delinquency churn.',
      recommendedAction: 'Deliver in-app and SMS prompt offering a one-time £15 account credit for setting up automated Direct Debit.',
      implementationSteps: [
        '1. Target Identification: Filter active accounts with Late Payments 12M > 0 and Direct Debit: No.',
        '2. Secure Link Delivery: SMS direct link to secure UK Direct Debit mandate setup.',
        '3. Instant Credit Application: Automatically credit £15 to next monthly invoice upon mandate verification.',
        '4. Payment Notification: Confirm automated billing schedule 3 days before payment collection.'
      ],
      measurableKpis: [
        'Direct Debit setup conversion (target ≥55%)',
        'Reduction in payment failure rate (<2%)',
        'Late fee reduction'
      ],
      measurementApproach: 'Monitor payment delinquency and account retention over subsequent 6 billing cycles.',
      supportingEvidence: [
        'Direct Debit: No',
        'Late Payments 12M ≥ 1',
        'Payment Method: Bank Transfer / Cheque'
      ],
      status: 'Approved'
    }
  ]);

  const updateStatus = (id: string, newStatus: RetentionRecommendation['status']) => {
    setRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec));
  };

  const filteredRecs = recommendations.filter(rec => {
    if (filterPriority !== 'All' && rec.priority !== filterPriority) return false;
    if (filterTeam !== 'All' && rec.responsibleTeam !== filterTeam) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Strategy Summary */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Personalised Customer Retention Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Evidence-grounded operational playbooks with step-by-step implementation sequences and governance KPIs
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
          </select>

          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Teams</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Retention">Retention Team</option>
            <option value="Billing">Billing & Collections</option>
            <option value="Customer Experience">Customer Experience</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        {filteredRecs.map(rec => {
          const priorityBadge = {
            Critical: 'bg-rose-100 text-[#8B1E2D] border-rose-200',
            High: 'bg-orange-100 text-orange-900 border-orange-200',
            Medium: 'bg-amber-100 text-amber-900 border-amber-200',
            Low: 'bg-slate-100 text-slate-800 border-slate-200'
          }[rec.priority];

          const statusBadge = {
            'Pending Review': 'bg-amber-50 text-amber-800 border-amber-200',
            'Approved': 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
            'In Progress': 'bg-blue-50 text-blue-800 border-blue-200',
            'Completed': 'bg-slate-100 text-slate-700 border-slate-200',
            'Dismissed': 'bg-rose-50 text-rose-800 border-rose-200'
          }[rec.status];

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-5"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${priorityBadge}`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Team: {rec.responsibleTeam}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs border ${statusBadge}`}>
                      Status: {rec.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {rec.title}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Target: <span className="font-semibold text-slate-700">{rec.targetCustomerOrSegment}</span> • Timeline: <span className="font-semibold text-slate-700">{rec.suggestedTimeline}</span> • Est. Cost: <span className="font-mono font-semibold text-slate-900">{formatGbp(rec.estimatedCostGbp)}</span>
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div className="flex items-center gap-2">
                  {rec.status !== 'Approved' && (
                    <button
                      onClick={() => updateStatus(rec.id, 'Approved')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Strategy</span>
                    </button>
                  )}
                  {rec.status === 'Approved' && (
                    <button
                      onClick={() => updateStatus(rec.id, 'In Progress')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-lg shadow-2xs transition-colors"
                    >
                      <span>Mark In Progress</span>
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(rec.id, 'Dismissed')}
                    className="p-1.5 text-slate-400 hover:text-[#8B1E2D] hover:bg-rose-50 rounded-lg transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Diagnosis & Objectives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1 text-[#8B1E2D] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Evidence-Based Risk Diagnosis
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rec.riskDiagnosis}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1 text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Commercial Business Objective
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rec.businessObjective}</p>
                </div>
              </div>

              {/* Recommended Action & Step-by-Step Implementation Sequence */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Implementation Sequence (Standard Operating Procedure)
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-800 mb-2">
                    Action: {rec.recommendedAction}
                  </div>
                  <div className="space-y-1.5">
                    {rec.implementationSteps.map((step, idx) => (
                      <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="font-mono font-bold text-[#142B4C] shrink-0 mt-0.5">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPIs & Supporting Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 mb-1.5">Measurable Governance KPIs:</div>
                  <ul className="space-y-1">
                    {rec.measurableKpis.map((kpi, idx) => (
                      <li key={idx} className="text-slate-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span>{kpi}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-1.5">Supporting Customer Data Points:</div>
                  <ul className="space-y-1">
                    {rec.supportingEvidence.map((ev, idx) => (
                      <li key={idx} className="text-slate-600 flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expected Impact Footer */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-950">
                  Expected Impact: {rec.expectedBusinessImpact}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">
                  Evaluation: {rec.measurementApproach}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
