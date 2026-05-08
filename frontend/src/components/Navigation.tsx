import React from 'react';
import './Navigation.css';

interface NavProps {
  isCollapsed: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggle: () => void;
}

const Navigation: React.FC<NavProps> = ({ isCollapsed, activeTab, onTabChange, onToggle }) => {
  const tabs = [
    { id: 'research', label: 'Research', icon: '🔍' },
    { id: 'bidding', label: 'Bidding', icon: '⚖️' },
    { id: 'work-queue', label: 'Work Queue', icon: '📦' },
    { id: 'store', label: 'Store', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className={`glass-nav ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        {!isCollapsed && <span className="logo-text">AUCTION MASTER</span>}
        <button onClick={onToggle} className="toggle-btn">
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <div className="nav-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {!isCollapsed && <span className="nav-label">{tab.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
