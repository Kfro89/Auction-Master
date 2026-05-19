import React from 'react';
import { DollarSign } from 'lucide-react';

interface CostLineItem {
  id?: number;
  label: string;
  amount: number;
  category: string;
  created_at?: string;
}

interface CostLineItemLedgerProps {
  items: CostLineItem[];
  title?: string;
  totalLabel?: string;
}

const CostLineItemLedger: React.FC<CostLineItemLedgerProps> = ({ items, title = "Item Financial Ledger", totalLabel = "Total Landed COGS" }) => {
  if (!items || items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <DollarSign size={16} className="text-emerald-600" /> {title}
      </h3>
      
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium">{item.label}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{item.category}</span>
            </div>
            <span className="font-mono text-gray-900">${item.amount.toFixed(2)}</span>
          </div>
        ))}

        <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100 font-bold">
          <span className="text-gray-600 text-sm">{totalLabel}</span>
          <span className="text-emerald-700 text-lg">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostLineItemLedger;