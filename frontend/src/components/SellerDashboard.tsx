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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          icon={<Package size={24} className="text-blue-400" />}
          label="Active Listings"
          value={stats.totalListed.toString()}
          secondaryValue={`$${stats.totalValue.toLocaleString()}`}
        />
        <KpiCard 
          icon={<ShoppingCart size={24} className="text-emerald-400" />}
          label="Sales (30d)"
          value={stats.totalSoldQty.toString()}
          secondaryValue={`$${stats.totalSoldRev.toLocaleString()}`}
        />
        <KpiCard 
          icon={<Zap size={24} className="text-amber-400" />}
          label="Sell-Through Rate"
          value={`${stats.strPct}%`}
          secondaryValue="30-day velocity"
        />
        <KpiCard 
          icon={<Clock size={24} className="text-purple-400" />}
          label="Avg Days on Market"
          value={`${stats.avgDaysOnMarket}d`}
          secondaryValue="Live inventory age"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 bg-rose-500/5 border-rose-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Unlisted "Death Pile" Value</span>
            <div className="text-2xl font-bold text-white mt-1">${stats.unlistedInventoryValue.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Sourcing ROI (YTD)</span>
            <div className="text-2xl font-bold text-white mt-1">142%</div>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
