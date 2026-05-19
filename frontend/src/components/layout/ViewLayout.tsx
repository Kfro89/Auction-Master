import React from 'react';

interface ViewContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out] p-4 sm:p-6 lg:p-8 ${className}`}>
    {children}
  </div>
);

interface ViewHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ title, subtitle, actions }) => (
  <header className="flex justify-between items-start mb-4">
    <div>
      <h1 className="text-display-lg text-on-background mb-1">
        {title}
      </h1>
      {subtitle && <p className="text-on-surface-variant text-body-md">{subtitle}</p>}
    </div>
    <div className="flex gap-2 items-center">
      {actions}
    </div>
  </header>
);

interface KpiBarProps {
  children: React.ReactNode;
}

export const KpiBar: React.FC<KpiBarProps> = ({ children }) => (
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
    {children}
  </section>
);

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  secondaryValue?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'hero';
}

export const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, secondaryValue, active, onClick, variant = 'default' }) => {
  const isHero = variant === 'hero';
  
  // Base classes matching Stitch exactly
  const baseClasses = `glass-card rounded-xl p-5 flex items-center gap-4 transition-all duration-200`;
  
  const variantClasses = isHero 
    ? 'border-primary bg-primary/5' 
    : active 
      ? 'border-secondary/50 bg-secondary/5' 
      : 'hover:bg-white/50 hover:shadow-sm';

  const iconColorClass = isHero ? 'text-primary' : active ? 'text-secondary' : 'text-secondary';
  const iconBgClass = isHero ? 'bg-primary/20' : active ? 'bg-secondary/20' : 'bg-secondary/10';

  return (
    <div 
      className={`${baseClasses} ${variantClasses} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`} 
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-label-caps text-on-surface-variant truncate uppercase">
          {label}
        </p>
        <div className="flex items-baseline gap-2 truncate">
          <p className="text-stat-xl text-primary">
            {value}
          </p>
          {secondaryValue && (
            <span className="text-table-data text-status-winning truncate">
              {secondaryValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterBarProps {
  title?: string;
  children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ title, children }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gray-200">
    {title && <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>}
    <div className="flex flex-wrap items-center gap-3">
      {children}
    </div>
  </div>
);
