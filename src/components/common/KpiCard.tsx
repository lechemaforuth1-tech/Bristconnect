import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: 'gold' | 'danger' | 'success' | 'none';
  tooltip?: string;
  expiryTags?: {
    days: number;
    count: number | string;
    mrr?: string;
  }[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = 'none',
  tooltip,
  expiryTags
}) => {
  const borderClass = {
    gold: 'border-l-4 border-l-[#D4AF37]',
    danger: 'border-l-4 border-l-[#8B1E2D]',
    success: 'border-l-4 border-l-[#15803D]',
    none: 'border-l border-slate-200'
  }[highlight];

  return (
    <div 
      className={`bg-white rounded-xl p-5 shadow-xs border border-slate-100 ${borderClass} hover:shadow-md transition-shadow duration-200 flex flex-col justify-between`}
      title={tooltip}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="mt-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {expiryTags && expiryTags.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          {expiryTags.map((tag) => (
            <span
              key={tag.days}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                tag.days <= 60 
                  ? 'bg-rose-50 text-[#8B1E2D] border border-rose-200' 
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <span className="font-bold">{tag.days} Days:</span>
              <span className="font-mono">{tag.count}</span>
              {tag.mrr && <span className="text-[10px] opacity-80">({tag.mrr})</span>}
            </span>
          ))}
        </div>
      )}

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-700' : 'text-[#8B1E2D]'}`}>
            {trend.value}
          </span>
          {trend.label && <span className="text-slate-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
