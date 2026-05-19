import React from 'react';
import { Eye, Heart, AlertCircle, TrendingUp, MoreVertical } from 'lucide-react';
import { formatItemName } from '../utils/formatters';

interface ActiveListing {
  id: number;
  ebay_item_id: string;
  title: string;
  price: number;
  views: number;
  watchers: number;
  impressions: number;
  clicks: number;
  duration_days: number;
  product_name?: string;
  brand?: string;
  condition?: string;
}

interface ActiveListingsPaneProps {
  listings: ActiveListing[];
  onAction?: (id: number, type: string) => void;
}

const ActiveListingsPane: React.FC<ActiveListingsPaneProps> = ({ listings }) => {
  return (
    <div className="active-listings-pane glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400" /> Live Inventory
        </h3>
        <span className="badge bg-emerald-500/20 text-emerald-400">{listings.length} Active</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
            <tr>
              <th className="pb-3 pl-2">Item Details</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-center">Traffic</th>
              <th className="pb-3 text-center">Engagement</th>
              <th className="pb-3 text-center">Age</th>
              <th className="pb-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {listings.map(item => {
              const isAging = item.duration_days > 90;
              const isCritical = item.duration_days > 180;

              return (
                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="flex flex-col">
                      <a 
                        href={`https://www.ebay.com/itm/${item.ebay_item_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:text-blue-400 transition-colors line-clamp-1 text-sm"
                      >
                        {formatItemName(item)}
                      </a>
                      <span className="text-[10px] text-gray-500 mono uppercase tracking-tight">ID: {item.ebay_item_id}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-white font-bold">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500">Impressions</span>
                        <span className="text-xs text-gray-300 font-medium">{item.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500">Clicks</span>
                        <span className="text-xs text-gray-300 font-medium">{item.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-500"><Eye size={12}/></span>
                        <span className="text-xs text-gray-300 font-medium">{item.views}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-500"><Heart size={12}/></span>
                        <span className="text-xs text-gray-300 font-medium">{item.watchers}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                        isAging ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                        'text-gray-400'
                      }`}>
                        {item.duration_days}d
                      </span>
                      {isAging && (
                        <span className="text-[9px] uppercase font-bold mt-1 text-amber-500/70 flex items-center gap-0.5">
                          <AlertCircle size={8}/> Stagnant
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {listings.length === 0 && (
          <div className="p-12 text-center text-gray-500 italic">
            No active listings found on eBay. Click Sync to refresh.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveListingsPane;
