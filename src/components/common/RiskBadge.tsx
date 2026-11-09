import React from 'react';
import { RiskTier } from '../../types';

interface RiskBadgeProps {
  tier?: RiskTier;
  prob?: number;
  showProb?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  tier = 'Low', 
  prob, 
  showProb = true, 
  size = 'md' 
}) => {
  const config = {
    Low: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Low Risk'
    },
    Moderate: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Moderate Risk'
    },
    High: {
      bg: 'bg-orange-50 text-orange-900 border-orange-200',
      dot: 'bg-orange-500',
      label: 'High Risk'
    },
    Critical: {
      bg: 'bg-rose-50 text-[#8B1E2D] border-rose-200 font-semibold',
      dot: 'bg-[#8B1E2D]',
      label: 'Critical Risk'
    }
  }[tier] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
    dot: 'bg-slate-400',
    label: tier
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {showProb && prob !== undefined && (
        <span className="opacity-75 font-mono">({Math.round(prob * 100)}%)</span>
      )}
    </span>
  );
};
