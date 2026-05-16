import { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import CommandPalette from './components/CommandPalette';
import ResearchView from './views/ResearchView';
import VehiclesView from './views/VehiclesView';
import SettingsView from './views/SettingsView';
import BiddingView from './views/BiddingView';
import WorkQueueView from './views/WorkQueueView';
import StoreView from './views/StoreView';
import LedgerView from './views/LedgerView';
import LoginView from './views/LoginView';
import WatchListView from './views/WatchListView';
import { CommandProvider } from './contexts/CommandContext';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('am_token'));
  const [activeTab, setActiveTab] = useState('research');
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!token) {
    return <LoginView onLogin={setToken} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'research':
        return <ResearchView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'watchlist':
        return <WatchListView />;
      case 'bidding':
        return <BiddingView />;
      case 'work-queue':
        return <WorkQueueView />;
      case 'store':
        return <StoreView />;
      case 'ledger':
        return <LedgerView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div><h1>Select a Tab</h1></div>;
    }
  };

  return (
    <CommandProvider>
      <div className="app-shell">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          <div className="cmd-hint" onClick={() => setIsCmdOpen(true)}>
            Press ⌘K to open Command Palette
          </div>
          {renderContent()}
        </main>
        <CommandPalette 
          isOpen={isCmdOpen} 
          onClose={() => setIsCmdOpen(false)} 
          onNavigate={setActiveTab} 
        />
      </div>
    </CommandProvider>
  );
}

export default App;
