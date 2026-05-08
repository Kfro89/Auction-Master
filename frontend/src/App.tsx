import { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('research');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'research':
        return <div><h1>Research</h1><p>Auction discovery and ROI analysis.</p></div>;
      case 'bidding':
        return <div><h1>Bidding</h1><p>Active bids and items ending today.</p></div>;
      case 'work-queue':
        return <div><h1>Work Queue</h1><p>Staging area for eBay listings.</p></div>;
      case 'store':
        return <div><h1>Store</h1><p>EBay inventory and performance analytics.</p></div>;
      case 'settings':
        return <div><h1>Settings</h1><p>Manage API credentials and authentication.</p></div>;
      default:
        return <div><h1>Select a Tab</h1></div>;
    }
  };

  return (
    <div className="app-shell">
      <Navigation 
        isCollapsed={isNavCollapsed} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)}
      />
      <main className="main-content" style={{ 
        marginLeft: isNavCollapsed ? 'var(--nav-width-collapsed)' : 'var(--nav-width-expanded)' 
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
