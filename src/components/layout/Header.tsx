import React, { useState } from 'react';
import { 
  Bell, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  User, 
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { DatasetMetadata, UserRole } from '../../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  metadata: DatasetMetadata | null;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  onOpenAssistant: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onReloadSample: () => void;
  isReloading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  metadata,
  unreadAlertCount,
  onOpenAlerts,
  onOpenAssistant,
  currentRole,
  setCurrentRole,
  onReloadSample,
  isReloading
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: UserRole[] = [
    'Administrator',
    'Data Scientist',
    'Executive',
    'Retention Manager',
    'Marketing Analyst',
    'Read-Only User'
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and breadcrumb */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-[#D4AF37]/15 text-[#91741e] rounded-sm uppercase tracking-wide border border-[#D4AF37]/30">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active Dataset Status Badge */}
          {metadata ? (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Database className="w-3.5 h-3.5 text-[#142B4C]" />
              <span className="font-semibold text-slate-900 max-w-[170px] truncate" title={metadata.filename}>
                {metadata.filename}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-mono">{metadata.rowCount.toLocaleString()} rows</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                <ShieldCheck className="w-3 h-3" />
                {metadata.dataQualityScore}%
              </span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              No active dataset loaded
            </div>
          )}

          {/* Quick Reload Sample Data button */}
          <button
            onClick={onReloadSample}
            disabled={isReloading}
            title="Reset to canonical 1,250 customer dataset"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isReloading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Baseline Data</span>
          </button>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold">{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active Role
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentRole === r ? 'text-[#142B4C] font-semibold bg-slate-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Early Warning Alerts Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Early Warning Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#8B1E2D] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* AI Intelligence Assistant Quick Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#091B33] hover:bg-[#142B4C] border border-[#D4AF37]/50 rounded-lg shadow-xs transition-all hover:shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>
    </header>
  );
};
