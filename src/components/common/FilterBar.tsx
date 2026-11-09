import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { GlobalFilterState } from '../../types';

interface FilterBarProps {
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  totalRecords: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalRecords,
  filteredCount
}) => {
  const hasActiveFilters = 
    Boolean(filters.searchQuery) ||
    Boolean(filters.customerSegment) ||
    Boolean(filters.ukNation) ||
    Boolean(filters.contractType) ||
    Boolean(filters.serviceType) ||
    Boolean(filters.riskTier);

  const resetFilters = () => {
    setFilters({
      customerSegment: '',
      ageBand: '',
      ukNation: '',
      city: '',
      serviceType: '',
      contractType: '',
      churnStatus: '',
      riskTier: '',
      searchQuery: ''
    });
  };

  return (
    <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search by Customer ID (e.g. BC-1042), City, or Plan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#142B4C] focus:bg-white"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Synchronised Select Dropdowns */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Segment */}
          <select
            value={filters.customerSegment}
            onChange={e => setFilters(prev => ({ ...prev, customerSegment: e.target.value }))}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#142B4C]"
          >
            <option value="">All Segments</option>
            <option value="Consumer">Consumer</option>
            <option value="Small Business">Small Business</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {/* UK Nation */}
          <select
            value={filters.ukNation}
            onChange={e => setFilters(prev => ({ ...prev, ukNation: e.target.value }))}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#142B4C]"
          >
            <option value="">All UK Nations</option>
            <option value="England">England</option>
            <option value="Scotland">Scotland</option>
            <option value="Wales">Wales</option>
            <option value="Northern Ireland">Northern Ireland</option>
          </select>

          {/* Contract */}
          <select
            value={filters.contractType}
            onChange={e => setFilters(prev => ({ ...prev, contractType: e.target.value }))}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#142B4C]"
          >
            <option value="">All Contracts</option>
            <option value="Month-to-Month">Month-to-Month</option>
            <option value="12 Month Contract">12 Month Contract</option>
            <option value="24 Month Contract">24 Month Contract</option>
            <option value="36 Month Contract">36 Month Contract</option>
          </select>

          {/* Service Type */}
          <select
            value={filters.serviceType}
            onChange={e => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#142B4C]"
          >
            <option value="">All Services</option>
            <option value="Fibre Broadband">Fibre Broadband</option>
            <option value="Mobile 5G">Mobile 5G</option>
            <option value="Landline & Broadband">Landline & Broadband</option>
            <option value="Triple Play">Triple Play</option>
            <option value="Quad Play">Quad Play</option>
          </select>

          {/* Risk Tier */}
          <select
            value={filters.riskTier}
            onChange={e => setFilters(prev => ({ ...prev, riskTier: e.target.value }))}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#142B4C]"
          >
            <option value="">All Risk Tiers</option>
            <option value="Critical">Critical Risk</option>
            <option value="High">High Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Filter count & Reset */}
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs text-slate-500 font-mono">
              <span className="font-semibold text-slate-900">{filteredCount.toLocaleString()}</span> of {totalRecords.toLocaleString()} accounts
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#8B1E2D] hover:bg-rose-50 border border-rose-200 rounded-md transition-colors font-medium"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
