import React from 'react';
import './ViewLayout.css';

interface ViewContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({ children, className = '' }) => (
  <div className={`view-container ${className}`}>
    {children}
  </div>
);

interface ViewHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ title, subtitle, actions }) => (
  <header className="view-header">
    <div className="header-title">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    <div className="header-actions">
      {actions}
    </div>
  </header>
);

interface KpiBarProps {
  children: React.ReactNode;
}

export const KpiBar: React.FC<KpiBarProps> = ({ children }) => (
  <section className="kpi-bar">
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
}

export const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, secondaryValue, active, onClick }) => (
  <div className={`kpi-card ${active ? 'active-filter' : ''} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div className="kpi-icon-wrap">{icon}</div>
    <div className="kpi-info">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">
        {value} {secondaryValue && <small>{secondaryValue}</small>}
      </span>
    </div>
  </div>
);

interface FilterBarProps {
  title?: string;
  children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ title, children }) => (
  <div className="saas-view-header">
    {title && <h2 className="saas-title">{title}</h2>}
    <div className="saas-filters">
      {children}
    </div>
  </div>
);
