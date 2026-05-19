import React, { useState } from 'react';
import { 
  Search, Gavel, Package, BarChart3, Settings, Eye, Car, Landmark, Shield, Truck, Zap
} from 'lucide-react';

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (id: string) => {
    switch(id) {
      case 'research': return <Search size={20} />;
      case 'vehicles': return <Car size={20} />;
      case 'watchlist': return <Eye size={20} />;
      case 'bidding': return <Gavel size={20} />;
      case 'work-queue': return <Package size={20} />;
      case 'fulfillment': return <Truck size={20} />;
      case 'rma': return <Shield size={20} />;
      case 'store': return <BarChart3 size={20} />;
      case 'ledger': return <Landmark size={20} />;
      case 'settings': return <Settings size={20} />;
      default: return <Search size={20} />;
    }
  };

  const mainTabs = [
    { id: 'research', label: 'Research' },
    { id: 'watchlist', label: 'Watch List' },
    { id: 'bidding', label: 'Bidding' },
    { id: 'vehicles', label: 'Vehicles' },
  ];

  const operationsTabs = [
    { id: 'work-queue', label: 'Work Queue' },
    { id: 'fulfillment', label: 'Fulfillment' },
    { id: 'rma', label: 'Returns' },
  ];

  const businessTabs = [
    { id: 'store', label: 'Store' },
    { id: 'ledger', label: 'Ledger' },
  ];

  const renderTab = (tab: { id: string, label: string }) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        className={`group relative flex items-center w-full rounded-lg transition-all duration-200 cursor-pointer border-none outline-none ${
          isExpanded ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'
        } ${
          isActive 
            ? 'bg-white/[0.12] text-white' 
            : 'bg-transparent text-white/60 hover:text-white hover:bg-white/[0.06]'
        }`}
        onClick={() => onTabChange(tab.id)}
        title={!isExpanded ? tab.label : undefined}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white`} />
        )}

        <div className={`shrink-0 flex items-center justify-center ${isExpanded ? 'ml-2' : ''}`}>
          {getIcon(tab.id)}
        </div>
        
        <span 
          className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}
          style={{ transitionDelay: isExpanded ? '80ms' : '0ms' }}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav 
      className="fixed left-0 top-0 bottom-0 z-[100] flex flex-col py-5 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl"
      style={{ 
        width: isExpanded ? '220px' : '72px',
        backgroundColor: 'rgba(19, 27, 46, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className={`flex items-center mb-6 transition-all duration-200 ${isExpanded ? 'px-5 gap-3' : 'justify-center px-0'}`}>
        <div className="text-white shrink-0">
          <Zap size={26} fill="currentColor" />
        </div>
        <span 
          className={`text-white font-bold text-base whitespace-nowrap transition-all duration-200 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}
          style={{ transitionDelay: isExpanded ? '80ms' : '0ms' }}
        >
          FlipControl
        </span>
      </div>
      
      {/* Main nav items */}
      <div className={`flex flex-col gap-0.5 ${isExpanded ? 'px-3' : 'px-2'}`}>
        {mainTabs.map(renderTab)}
        
        <div className="h-px bg-white/10 my-3 mx-2" />
        
        {operationsTabs.map(renderTab)}
        
        <div className="h-px bg-white/10 my-3 mx-2" />
        
        {businessTabs.map(renderTab)}
      </div>

      {/* Bottom: Settings */}
      <div className={`mt-auto flex flex-col gap-0.5 ${isExpanded ? 'px-3' : 'px-2'}`}>
        <div className="h-px bg-white/10 mb-3 mx-2" />
        {renderTab({ id: 'settings', label: 'Settings' })}
      </div>
    </nav>
  );
};

export default Navigation;