import React from 'react';
import { StatusLevel } from '../../types';

interface StatusBadgeProps {
  status: StatusLevel | 'ready' | 'pending' | 'critical' | 'maintenance' | 'operational' | 'near-capacity' | 'preparing' | 'pending-check' | 'verified' | 'flagged' | 'warning' | 'info';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  glow = false,
}) => {
  let colorClasses = '';
  let displayText = label || status;

  switch (status) {
    case 'ready':
    case 'operational':
    case 'verified':
      colorClasses = 'bg-[#2FBF71]/15 text-[#2FBF71] border-[#2FBF71]/30';
      if (glow) colorClasses += ' glow-green';
      break;

    case 'pending':
    case 'pending-check':
    case 'preparing':
    case 'near-capacity':
    case 'warning':
    case 'maintenance':
      colorClasses = 'bg-[#F2B138]/15 text-[#F2B138] border-[#F2B138]/30';
      if (glow) colorClasses += ' glow-amber';
      break;

    case 'critical':
    case 'flagged':
      colorClasses = 'bg-[#E4572E]/15 text-[#E4572E] border-[#E4572E]/40 animate-pulse';
      if (glow) colorClasses += ' glow-red';
      break;

    case 'info':
      colorClasses = 'bg-[#2E9CCA]/15 text-[#2E9CCA] border-[#2E9CCA]/30';
      if (glow) colorClasses += ' glow-cyan';
      break;

    default:
      colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase tracking-wider font-mono ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'critical' || status === 'flagged'
            ? 'bg-[#E4572E] animate-ping'
            : status === 'ready' || status === 'operational'
            ? 'bg-[#2FBF71]'
            : 'bg-[#F2B138]'
        }`}
      />
      {displayText}
    </span>
  );
};
