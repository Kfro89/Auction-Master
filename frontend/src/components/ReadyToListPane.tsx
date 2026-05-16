import React, { useState } from 'react';
import { DollarSign, ExternalLink, Send, Info } from 'lucide-react';

interface ReadyItem {
  id: number;
  title: string;
  total_cogs: number;
  estimated_price: number;
  suggested_package_cost: number;
}

interface ReadyToListPaneProps {
  items: ReadyItem[];
  onList: (id: number, price: number) => void;
}

const ReadyToListPane: React.FC<ReadyToListPaneProps> = ({ items, onList }) => {
  const [prices, setPrices] = useState<Record<number, number>>({});

  const EBAY_FEE_PCT = 0.135;

  const calculateNet = (item: ReadyItem, listPrice: number) => {
    const fees = listPrice * EBAY_FEE_PCT;
    const net = listPrice - item.total_cogs - fees - item.suggested_package_cost;
    return net;
  };

  return (
    <div className="ready-to-list-pane glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Send size={20} className="text-blue-400" /> Ready to List
        </h3>
        <span className="badge bg-blue-500/20 text-blue-400">{items.length} Items</span>
      </div>

      <div className="space-y-4">
        {items.map(item => {
          const currentPrice = prices[item.id] || item.estimated_price || 0;
          const net = calculateNet(item, currentPrice);
          const roi = (net / item.total_cogs) * 100;

          return (
            <div key={item.id} className="listing-prep-card glass-panel p-4 bg-white/5 border-white/10 hover:border-blue-500/30 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="item-details">
                  <h4 className="text-white font-medium mb-1 truncate" title={item.title}>{item.title}</h4>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><DollarSign size={12}/> COGS: ${item.total_cogs.toFixed(2)}</span>
                    <span className="flex items-center gap-1"><Info size={12}/> Pack: ${item.suggested_package_cost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pricing-strategy flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Proposed List Price</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="number"
                        className="frosted-input w-full pl-8 py-2 text-sm"
                        value={currentPrice}
                        onChange={(e) => setPrices({...prices, [item.id]: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <button 
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                      title="Check Sold Comps"
                      onClick={() => window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(item.title)}&_sacat=0&LH_Sold=1&LH_Complete=1`, '_blank')}
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>

                <div className="net-calc flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Projected Net</span>
                    <span className={`text-lg font-bold ${net > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${net.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">ROI</span>
                    <span className={`text-sm font-bold ${roi > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {roi.toFixed(1)}%
                    </span>
                  </div>
                  <button 
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                    onClick={() => onList(item.id, currentPrice)}
                  >
                    List Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-12 text-center text-gray-500 italic">
            No items ready to list. Complete staging in the Work Queue to see them here.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadyToListPane;
