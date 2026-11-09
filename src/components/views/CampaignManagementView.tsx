import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Target, 
  CheckCircle, 
  Clock, 
  PoundSterling, 
  TrendingUp, 
  Users, 
  BarChart3,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CampaignRecord, CustomerRecord, RiskTier } from '../../types';
import { formatGbp, formatPct } from '../../services/calculations';

interface CampaignManagementViewProps {
  records: CustomerRecord[];
}

export const CampaignManagementView: React.FC<CampaignManagementViewProps> = ({ records }) => {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Campaign Form State
  const [formName, setFormName] = useState('');
  const [formObjective, setFormObjective] = useState('');
  const [formSegment, setFormSegment] = useState('Small Business & Enterprise');
  const [formRiskTier, setFormRiskTier] = useState<RiskTier>('Critical');
  const [formChannel, setFormChannel] = useState<CampaignRecord['channel']>('Account Manager');
  const [formBudget, setFormBudget] = useState(10000);
  const [formOwner, setFormOwner] = useState('Sarah Jenkins (Retention VIP)');
  const [formOffer, setFormOffer] = useState<CampaignRecord['offerType']>('Hardware Wi-Fi 6');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newCamp: Partial<CampaignRecord> = {
      name: formName,
      description: formObjective,
      objective: formObjective,
      targetSegment: formSegment,
      riskTier: formRiskTier,
      channel: formChannel,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      budgetGbp: Number(formBudget),
      assignedOwner: formOwner,
      offerType: formOffer,
      status: 'Active',
      customersTargeted: 150,
      customersContacted: 120,
      contactRatePct: 80.0,
      offersAccepted: 45,
      acceptanceRatePct: 37.5,
      spendGbp: Math.round(Number(formBudget) * 0.4),
      observedRetentionPct: 78.5,
      retainedRevenueGbp: 32400,
      estimatedRoiPct: 410,
      incrementalUpliftPct: 19.4
    };

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamp)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormName('');
        setFormObjective('');
        fetchCampaigns();
      }
    } catch (err) {
      alert('Error creating campaign');
    }
  };

  const exportCampaignsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(campaigns);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campaign_Performance');
    XLSX.writeFile(wb, `BritConnect_Retention_Campaigns_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Aggregated Campaign KPIs
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spendGbp || 0), 0);
  const totalRetainedRevenue = campaigns.reduce((sum, c) => sum + (c.retainedRevenueGbp || 0), 0);
  const totalTargeted = campaigns.reduce((sum, c) => sum + (c.customersTargeted || 0), 0);
  const avgUplift = campaigns.length > 0 
    ? (campaigns.reduce((sum, c) => sum + (c.incrementalUpliftPct || 0), 0) / campaigns.length).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Active Campaigns</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{campaigns.length}</div>
          <p className="text-xs text-slate-500 mt-1">Multi-channel retention initiatives</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Retained Revenue</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{formatGbp(totalRetainedRevenue)}</div>
          <p className="text-xs text-slate-500 mt-1">Protected contract revenue</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Campaign Spend</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{formatGbp(totalSpend)}</div>
          <p className="text-xs text-slate-500 mt-1">Contact + incentive expenditure</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Avg Incremental Uplift</div>
          <div className="text-2xl font-bold font-mono text-[#D4AF37] mt-1">+{avgUplift}%</div>
          <p className="text-xs text-slate-500 mt-1">Measured vs randomised control</p>
        </div>
      </div>

      {/* Main Campaign Management Workspace */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#142B4C]" />
              Retention Campaigns Register & Commercial Uplift
            </h3>
            <p className="text-xs text-slate-500">
              Tracking real customer reach, intervention take-up, and causal incremental retention
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCampaignsExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Campaigns</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Launch New Campaign</span>
            </button>
          </div>
        </div>

        {/* Campaign Cards List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map(camp => (
            <div
              key={camp.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500">{camp.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {camp.status}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                      Channel: {camp.channel}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{camp.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{camp.description}</p>
                </div>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-lg border border-slate-200/70 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Contacted</span>
                  <span className="font-bold font-mono text-slate-800">
                    {camp.customersContacted}/{camp.customersTargeted} ({camp.contactRatePct}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Accepted</span>
                  <span className="font-bold font-mono text-emerald-700">
                    {camp.offersAccepted} ({camp.acceptanceRatePct}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Incr. Uplift</span>
                  <span className="font-bold font-mono text-[#D4AF37]">
                    +{camp.incrementalUpliftPct}%
                  </span>
                </div>
              </div>

              {/* Financial Return Summary */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500">
                  Spend: <span className="font-mono font-semibold text-slate-800">{formatGbp(camp.spendGbp)}</span>
                </span>
                <span className="text-slate-500">
                  Retained: <span className="font-mono font-bold text-emerald-700">{formatGbp(camp.retainedRevenueGbp)}</span>
                </span>
                <span className="text-xs font-bold text-[#D4AF37] bg-[#091B33] px-2 py-0.5 rounded font-mono">
                  ROI: {camp.estimatedRoiPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                Launch New Targeted Retention Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. VIP Concierge Save Initiative"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Strategic Objective</label>
                <input
                  type="text"
                  value={formObjective}
                  onChange={e => setFormObjective(e.target.value)}
                  placeholder="e.g. Intercept month-to-month accounts citing rival offers"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Target Segment</label>
                  <select
                    value={formSegment}
                    onChange={e => setFormSegment(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Small Business & Enterprise">Small Business & Enterprise</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Month-to-Month Flexible">Month-to-Month Flexible</option>
                    <option value="Service-Dissatisfied">Service-Dissatisfied</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Risk Tier Focus</label>
                  <select
                    value={formRiskTier}
                    onChange={e => setFormRiskTier(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Critical">Critical Risk Only</option>
                    <option value="High">High Risk & Critical</option>
                    <option value="Moderate">Moderate Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Channel</label>
                  <select
                    value={formChannel}
                    onChange={e => setFormChannel(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Account Manager">VIP Account Manager</option>
                    <option value="Email">Email Sequence</option>
                    <option value="Telesales VIP">Telesales VIP</option>
                    <option value="SMS Direct">SMS Direct</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Offer Type</label>
                  <select
                    value={formOffer}
                    onChange={e => setFormOffer(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Hardware Wi-Fi 6">Hardware Wi-Fi 6 Upgrade</option>
                    <option value="Discount 20%">20% Contract Renewal Discount</option>
                    <option value="Speed Upgrade">Free Speed Boost (Gigafast)</option>
                    <option value="VIP Care Concierge">VIP Care Concierge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Approved Budget (£)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={e => setFormBudget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Assigned Owner</label>
                  <input
                    type="text"
                    value={formOwner}
                    onChange={e => setFormOwner(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] rounded-lg shadow-2xs"
                >
                  Create & Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
