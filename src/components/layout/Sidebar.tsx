import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  ShieldCheck, 
  TrendingDown, 
  Target, 
  Users, 
  PoundSterling, 
  Sparkles, 
  Megaphone, 
  FlaskConical, 
  Bot, 
  FileText, 
  Settings, 
  History, 
  BellRing, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Radio
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab = 
  | 'overview' 
  | 'data-management' 
  | 'data-quality' 
  | 'churn-analytics' 
  | 'churn-prediction' 
  | 'segmentation' 
  | 'revenue-intelligence' 
  | 'retention-intelligence' 
  | 'campaigns' 
  | 'model-lab' 
  | 'ai-assistant' 
  | 'reports' 
  | 'settings' 
  | 'audit-logs' 
  | 'alerts' 
  | 'help-docs';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  unreadAlertCount: number;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  unreadAlertCount,
  currentRole
}) => {
  const mainNavItems = [
    { id: 'overview' as NavTab, label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'data-management' as NavTab, label: 'Data Management', icon: Database },
    { id: 'data-quality' as NavTab, label: 'Data Quality & Prep', icon: ShieldCheck },
    { id: 'churn-analytics' as NavTab, label: 'Churn Analytics', icon: TrendingDown },
    { id: 'churn-prediction' as NavTab, label: 'Churn Prediction', icon: Target },
    { id: 'segmentation' as NavTab, label: 'Customer Segmentation', icon: Users },
    { id: 'revenue-intelligence' as NavTab, label: 'Revenue Intelligence', icon: PoundSterling },
    { id: 'retention-intelligence' as NavTab, label: 'Retention Intelligence', icon: Sparkles },
    { id: 'campaigns' as NavTab, label: 'Campaign Management', icon: Megaphone },
    { id: 'model-lab' as NavTab, label: 'Model Laboratory', icon: FlaskConical },
    { id: 'ai-assistant' as NavTab, label: 'AI Analytics Assistant', icon: Bot },
    { id: 'reports' as NavTab, label: 'Reports & Exports', icon: FileText },
  ];

  const adminNavItems = [
    { id: 'alerts' as NavTab, label: 'Alerts & Early Warning', icon: BellRing, badge: unreadAlertCount },
    { id: 'settings' as NavTab, label: 'Settings & Policy', icon: Settings },
    { id: 'audit-logs' as NavTab, label: 'Audit Logs', icon: History },
    { id: 'help-docs' as NavTab, label: 'Help & Data Dictionary', icon: BookOpen },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-[#091B33] text-white border-r border-[#142B4C] transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#142B4C] bg-[#091B33]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#142B4C] to-[#091B33] border border-[#D4AF37]/40 flex items-center justify-center shadow-inner">
              <Radio className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">BritConnect</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-[#D4AF37] text-[#091B33]">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">Churn Intelligence</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-lg bg-[#142B4C] border border-[#D4AF37]/50 flex items-center justify-center">
            <Radio className="w-5 h-5 text-[#D4AF37]" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#142B4C] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Main Operations
            </div>
          )}
          <nav className="space-y-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#142B4C] text-[#D4AF37] shadow-xs border-l-2 border-[#D4AF37]'
                      : 'text-slate-300 hover:bg-[#142B4C]/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Administration & Safety
            </div>
          )}
          <nav className="space-y-1">
            {adminNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#142B4C] text-[#D4AF37] border-l-2 border-[#D4AF37]'
                      : 'text-slate-300 hover:bg-[#142B4C]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#8B1E2D] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Footer */}
      <div className="p-3 border-t border-[#142B4C] bg-[#071426]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">Enterprise Workspace</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Role: <span className="text-[#D4AF37] font-medium">{currentRole}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`Role: ${currentRole}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
