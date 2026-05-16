import React from 'react';
import './Navigation.css';
import { Search, Gavel, Package, BarChart3, Settings, Eye, Car, Landmark, Shield } from 'lucide-react';

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  const getIcon = (id: string) => {
    switch(id) {
      case 'research': return <Search size={22} />;
      case 'vehicles': return <Car size={22} />;
      case 'watchlist': return <Eye size={22} />;
      case 'bidding': return <Gavel size={22} />;
      case 'work-queue': return <Package size={22} />;
      case 'rma': return <Shield size={22} />;
      case 'store': return <BarChart3 size={22} />;
      case 'ledger': return <Landmark size={22} />;
      case 'settings': return <Settings size={22} />;
      default: return <Search size={22} />;
    }
  };

  const tabs = [
    { id: 'research', label: 'Research' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'watchlist', label: 'Watch List' },
    { id: 'bidding', label: 'Bidding' },
    { id: 'work-queue', label: 'Work Queue' },
    { id: 'fulfillment', label: 'Fulfillment' },
    { id: 'rma', label: 'Returns' },
    { id: 'store', label: 'Store' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="floating-pill-nav">
      <div className="nav-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            <span className="nav-icon">{getIcon(tab.id)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
