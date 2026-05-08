import React from 'react';
import './Navigation.css';
import { Search, Gavel, Package, BarChart3, Settings, ArrowRight, ArrowLeft } from 'lucide-react';

interface NavProps {
  isCollapsed: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggle: () => void;
}

const Navigation: React.FC<NavProps> = ({ isCollapsed, activeTab, onTabChange, onToggle }) => {
  const getIcon = (id: string) => {
    switch(id) {
      case 'research': return <Search size={20} />;
      case 'bidding': return <Gavel size={20} />;
      case 'work-queue': return <Package size={20} />;
      case 'store': return <BarChart3 size={20} />;
      case 'settings': return <Settings size={20} />;
      default: return <Search size={20} />;
    }
  };

  const tabs = [
    { id: 'research', label: 'Research' },
    { id: 'bidding', label: 'Bidding' },
    { id: 'work-queue', label: 'Work Queue' },
    { id: 'store', label: 'Store' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav className={`glass-nav ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        {!isCollapsed && <span className="logo-text">AUCTION MASTER</span>}
        <button onClick={onToggle} className="toggle-btn" title={isCollapsed ? "Expand" : "Collapse"}>
          {isCollapsed ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
        </button>
      </div>
      <div className="nav-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={isCollapsed ? tab.label : undefined}
          >
            <span className="nav-icon">{getIcon(tab.id)}</span>
            {!isCollapsed && <span className="nav-label">{tab.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
