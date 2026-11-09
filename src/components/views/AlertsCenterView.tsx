import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  Calendar, 
  UserCheck, 
  ArrowRight,
  Check
} from 'lucide-react';
import { AlertItem } from '../../types';

interface AlertsCenterViewProps {
  onSelectCustomer?: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({
  onSelectCustomer,
  onNavigateToTab
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resolved' as const } : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#8B1E2D]" />
            Early Warning Churn Surveillance & Alert Centre
          </h2>
          <p className="text-xs text-slate-500">
            Real-time surveillance detecting network flare-ups, payment friction, and contract expiration vulnerabilities
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 bg-rose-50 text-[#8B1E2D] border border-rose-200 rounded-md">
            {alerts.filter(a => a.status === 'Unread').length} Active Alerts
          </span>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {alerts.map(alert => {
          const isCritical = alert.severity === 'Critical';
          const isResolved = alert.status === 'Resolved';

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl p-5 border shadow-2xs transition-all ${
                isResolved
                  ? 'border-slate-200 opacity-60'
                  : isCritical
                  ? 'border-l-4 border-l-[#8B1E2D] border-slate-200'
                  : 'border-l-4 border-l-amber-500 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCritical
                        ? 'bg-rose-100 text-[#8B1E2D]'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {alert.severity} Alert
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {alert.alertType}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {new Date(alert.timestamp).toLocaleString('en-GB')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 font-medium pt-1">
                    Affected Cohort: <span className="font-semibold text-slate-900">{alert.affectedCustomerOrSegment}</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Trigger Condition: </span>
                    {alert.triggerCondition}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 mt-2">
                    <span className="font-semibold text-[#142B4C]">Recommended Operational Action: </span>
                    {alert.suggestedAction}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">
                    Owner: {alert.assignedOwner}
                  </span>

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
