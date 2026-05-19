import React from 'react';
import { KpiCard } from './layout/ViewLayout';
import { DollarSign, ShoppingCart, TrendingUp, Zap, Clock, Package } from 'lucide-react';

interface DashboardStats {
  totalListed: number;
  totalValue: number;
  totalSoldQty: number;
  totalSoldRev: number;
  strPct: number;
  avgDaysOnMarket: number;
  unlistedInventoryValue: number;
}

interface SellerDashboardProps {
  stats: DashboardStats;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ stats }) => {
  return (
    <div className="seller-dashboard mb-8">
      <div className="kpi-grid">
        <KpiCard 
          icon={<Package size={24} style={{color: "#3b82f6"}} />}
          label="Active Listings"
          value={stats.totalListed.toString()}
          secondaryValue={`$${stats.totalValue.toLocaleString()}`}
        />
        <KpiCard 
          icon={<ShoppingCart size={24} style={{color: "#10b981"}} />}
          label="Sales (30d)"
          value={stats.totalSoldQty.toString()}
          secondaryValue={`$${stats.totalSoldRev.toLocaleString()}`}
        />
        <KpiCard 
          icon={<Zap size={24} style={{color: "#f59e0b"}} />}
          label="Sell-Through Rate"
          value={`${stats.strPct}%`}
          secondaryValue="30-day velocity"
        />
        <KpiCard 
          icon={<Clock size={24} style={{color: "#8b5cf6"}} />}
          label="Avg Days on Market"
          value={`${stats.avgDaysOnMarket}d`}
          secondaryValue="Live inventory age"
        />
      </div>

      <div className="chart-grid">
        <div className="glass-card rounded-xl p-5 flex-between">
          <div>
            <span className="text-xs-caps">Unlisted "Death Pile" Value</span>
            <div className="text-3xl-bold">${stats.unlistedInventoryValue.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-error/10 rounded-full text-error flex-center">
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex-between">
          <div>
            <span className="text-xs-caps">Sourcing ROI (YTD)</span>
            <div className="text-3xl-bold">142%</div>
          </div>
          <div className="p-3 bg-status-winning/10 rounded-full text-status-winning flex-center">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
