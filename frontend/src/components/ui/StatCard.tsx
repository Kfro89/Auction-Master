import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendDirection, className = '' }: StatCardProps) {
  return (
    <Card className={`p-6 flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="text-label-caps text-on-surface-variant">
          {label}
        </div>
        {icon && (
          <div className="text-secondary bg-[color-mix(in_srgb,var(--color-secondary)_10%,transparent)] p-2 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="text-stat-xl text-on-surface">
        {value}
      </div>
      {trend && (
        <div className={`text-body-sm flex items-center gap-1 ${
          trendDirection === 'up' ? 'text-[var(--color-status-winning)]' : 
          trendDirection === 'down' ? 'text-[var(--color-status-outbid)]' : 
          'text-on-surface-variant'
        }`}>
          {trendDirection === 'up' ? '↑ ' : trendDirection === 'down' ? '↓ ' : ''}
          {trend}
        </div>
      )}
    </Card>
  );
}