import React from 'react';
import { DollarSign, Plus } from 'lucide-react';

interface CostLineItem {
  id?: number;
  label: string;
  amount: number;
  category: string;
  created_at?: string;
}

interface CostLineItemLedgerProps {
  items: CostLineItem[];
  onAddCost?: (label: string, amount: number, category: string) => void;
  title?: string;
}

const CostLineItemLedger: React.FC<CostLineItemLedgerProps> = ({ items, onAddCost, title = "Item Financial Ledger" }) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const [isAdding, setIsAdding] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState('');
  const [newAmount, setNewAmount] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('refurb');

  const handleAdd = () => {
    if (!newLabel || !newAmount) return;
    onAddCost?.(newLabel, parseFloat(newAmount), newCategory);
    setNewLabel('');
    setNewAmount('');
    setIsAdding(false);
  };

  return (
    <div className="cost-ledger glass-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
          <DollarSign size={14} className="text-emerald-400" /> {title}
        </h3>
        {onAddCost && !isAdding && (
          <button 
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={12} /> Add Expense
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
            <div className="flex flex-col">
              <span className="text-gray-200">{item.label}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</span>
            </div>
            <span className="font-mono text-gray-300">${item.amount.toFixed(2)}</span>
          </div>
        ))}

        {isAdding && (
          <div className="bg-white/5 p-3 rounded-lg border border-blue-500/30 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input 
                type="text" 
                placeholder="Label (e.g. Battery)" 
                className="frosted-input w-full text-xs"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Amount" 
                className="frosted-input w-full text-xs"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <select 
                className="frosted-input text-[10px] py-1"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                <option value="refurb">Refurbish</option>
                <option value="acquisition">Acquisition</option>
                <option value="packaging">Packaging</option>
                <option value="misc">Misc</option>
              </select>
              <div className="flex gap-2">
                <button className="text-[10px] text-gray-500" onClick={() => setIsAdding(false)}>Cancel</button>
                <button className="text-[10px] text-blue-400 font-bold" onClick={handleAdd}>Add</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10 font-bold">
          <span className="text-gray-400">Total Landed COGS</span>
          <span className="text-emerald-400 text-lg">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostLineItemLedger;
