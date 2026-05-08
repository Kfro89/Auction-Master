import { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import ResearchView from './views/ResearchView';
import SettingsView from './views/SettingsView';
import BiddingView from './views/BiddingView';
import WorkQueueView from './views/WorkQueueView';
import StoreView from './views/StoreView';
import LoginView from './views/LoginView';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('am_token'));
  const [activeTab, setActiveTab] = useState('research');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<React.ReactNode>(null);

  if (!token) {
    return <LoginView onLogin={setToken} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'research':
        return <ResearchView setSidebarContent={setSidebarContent} />;
      case 'bidding':
        return <BiddingView />;
      case 'work-queue':
        return <WorkQueueView />;
      case 'store':
        return <StoreView />;
      case 'settings':
        return <SettingsView />;
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
        sidebarContent={sidebarContent}
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
