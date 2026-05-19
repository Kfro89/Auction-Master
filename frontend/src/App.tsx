import { useState } from 'react';
import { AppShell } from './components/shell/AppShell';
import ResearchView from './views/ResearchView';
import VehiclesView from './views/VehiclesView';
import SettingsView from './views/SettingsView';
import BiddingView from './views/BiddingView';
import WorkQueueView from './views/WorkQueueView';
import StoreView from './views/StoreView';
import LedgerView from './views/LedgerView';
import LoginView from './views/LoginView';
import WatchListView from './views/WatchListView';
import RmaView from './views/RmaView';
import { FulfillmentView } from './views/FulfillmentView';

const VIEW_META: Record<string, { title: string; subtitle?: string }> = {
  research: { title: 'Research', subtitle: 'Evaluate auction items and lock in target bids' },
  watchlist: { title: 'Watchlist', subtitle: 'Items you are tracking for upcoming auctions' },
  bidding: { title: 'Bidding', subtitle: 'Active bids, exposure, and projected profit' },
  vehicles: { title: 'Vehicles', subtitle: 'Vehicle-specific research and valuation' },
  'work-queue': { title: 'Work Queue', subtitle: 'Move acquired items through the fulfillment pipeline' },
  fulfillment: { title: 'Fulfillment', subtitle: 'Pick, pack, ship, and track sold orders' },
  rma: { title: 'Returns', subtitle: 'Manage returns and RMA processing' },
  store: { title: 'Store', subtitle: 'Active eBay listings and store performance' },
  ledger: { title: 'Business Ledger', subtitle: 'Operating costs, recurring expenses, and P&L' },
  settings: { title: 'Settings', subtitle: 'Account, integrations, and appearance' },
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('am_token'));
  const [activeTab, setActiveTab] = useState('research');

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
      case 'fulfillment':
        return <FulfillmentView />;
      case 'rma':
        return <RmaView />;
      case 'store':
        return <StoreView />;
      case 'ledger':
        return <LedgerView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  const meta = VIEW_META[activeTab] ?? { title: '' };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} title={meta.title} subtitle={meta.subtitle}>
      {renderContent()}
    </AppShell>
  );
}

export default App;
