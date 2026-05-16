import React, { useState, useEffect } from 'react';
import './StoreView.css'; // Reusing some glass styles
import { ViewContainer, ViewHeader } from '../components/layout/ViewLayout';
import { 
  Plus, Trash2, Calendar, Repeat, DollarSign, Landmark,
  Receipt, TrendingUp
} from 'lucide-react';

interface Expense {
  id: number;
  date: string;
  amount: number;
  payee: string;
  category: string;
  description: string;
  is_recurring: boolean;
}

const CATEGORIES = ['Auto/Travel', 'Supplies', 'Rent/Lease', 'Software/Tech', 'Legal/Professional', 'Misc'];

const LedgerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'pnl'>('ledger');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState({ totalExpenses: 0, byCategory: {} as Record<string, number> });
  const [pnl, setPnl] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: 0,
    payee: '',
    category: 'Supplies',
    description: '',
    is_recurring: false,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [listResp, statsResp, pnlResp] = await Promise.all([
        fetch('/api/expenses/'),
        fetch('/api/expenses/stats'),
        fetch('/api/analytics/pnl?timeframe=YTD')
      ]);
      if (listResp.ok) setExpenses(await listResp.json());
      if (statsResp.ok) setStats(await statsResp.json());
      if (pnlResp.ok) setPnl(await pnlResp.json());
    } catch (error) {
      console.error('Failed to fetch ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/expenses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (response.ok) {
        await fetchData();
        setIsAdding(false);
        setNewExpense({
          amount: 0,
          payee: '',
          category: 'Supplies',
          description: '',
          is_recurring: false,
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading) return <div className="loading">Loading business ledger...</div>;

  return (
    <ViewContainer className="ledger-view">
      <ViewHeader 
        title="Business Ledger" 
        subtitle="Manage operational overhead and recurring business expenses."
        actions={
          <button className="action-btn primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Log Expense
          </button>
        }
      />

      <div className="flex gap-4 mb-6">
        <button 
          className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <Receipt size={18} /> Operational Ledger
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pnl' ? 'active' : ''}`}
          onClick={() => setActiveTab('pnl')}
        >
          <TrendingUp size={18} /> Profit & Loss
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 bg-rose-500/5 border-rose-500/20">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase font-bold text-gray-500">Total Operational Overhead</span>
                <Landmark size={20} className="text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-white">${stats.totalExpenses.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-2">All-time operational spending</div>
            </div>

            <div className="glass-panel p-6 col-span-2">
              <h4 className="text-xs uppercase font-bold text-gray-500 mb-4">Spending by Category</h4>
              <div className="flex flex-wrap gap-6">
                {Object.entries(stats.byCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{cat}</span>
                    <span className="text-white font-bold">${amount.toLocaleString()}</span>
                    <div className="w-24 h-1 bg-white/5 rounded-full mt-1">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(amount / stats.totalExpenses) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isAdding && (
            <div className="glass-panel p-6 mb-8 border-2 border-blue-500/30 animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="field-group">
                  <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Amount ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="number" 
                      className="frosted-input-large pl-10"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Payee / Vendor</label>
                  <input 
                    type="text" 
                    className="frosted-input-large"
                    placeholder="e.g. Storage Unit X"
                    value={newExpense.payee}
                    onChange={e => setNewExpense({...newExpense, payee: e.target.value})}
                  />
                </div>
                <div className="field-group">
                  <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Category</label>
                  <select 
                    className="frosted-input-large"
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="field-group">
                  <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Description</label>
                  <input 
                    type="text" 
                    className="frosted-input-large"
                    placeholder="Monthly rent, tape, etc."
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-8 pt-8">
                  <div className="field-group flex-1">
                    <input 
                      type="date" 
                      className="frosted-input-large"
                      value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${newExpense.is_recurring ? 'bg-blue-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${newExpense.is_recurring ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-bold text-gray-300">Recurring</span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={newExpense.is_recurring}
                      onChange={e => setNewExpense({...newExpense, is_recurring: e.target.checked})}
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button className="action-btn outline" onClick={() => setIsAdding(false)}>Cancel</button>
                <button className="action-btn primary px-12" onClick={handleCreate}>Save Expense</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payee & Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map(expense => (
                  <tr key={expense.id} className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-300">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{expense.payee}</span>
                        <span className="text-xs text-gray-500">{expense.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                        {expense.category}
                      </span>
                      {expense.is_recurring && <Repeat size={12} className="inline ml-2 text-blue-400" />}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-rose-400 font-bold text-lg">-${expense.amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <button 
                        className="p-2 text-gray-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="pnl-dashboard animate-in fade-in">
          {pnl && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-panel p-6">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Gross Revenue</span>
                  <div className="text-2xl font-bold text-white mt-1">${pnl.revenue.toLocaleString()}</div>
                </div>
                <div className="glass-panel p-6">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Total COGS (Sourced)</span>
                  <div className="text-2xl font-bold text-rose-400 mt-1">-${pnl.cogs.toLocaleString()}</div>
                </div>
                <div className="glass-panel p-6">
                  <span className="text-[10px] uppercase font-bold text-gray-500">EBay Fees & Shipping</span>
                  <div className="text-2xl font-bold text-rose-400 mt-1">-${(pnl.ebayFees + pnl.shippingCosts).toLocaleString()}</div>
                </div>
                <div className="glass-panel p-6 bg-emerald-500/10 border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Total Business Net</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">${pnl.netBusinessIncome.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-emerald-500/70 mt-1">{pnl.margin.toFixed(1)}% Net Margin</div>
                </div>
              </div>

              <div className="glass-panel p-8">
                <h3 className="text-xl font-bold text-white mb-8">Statement of Profit and Loss (YTD)</h3>
                
                <div className="space-y-6 max-w-2xl">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-300">Total Revenue (Gross Sales)</span>
                    <span className="text-white font-bold">${pnl.revenue.toLocaleString()}</span>
                  </div>
                  
                  <div className="pl-4 space-y-2 border-l-2 border-white/5">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Inventory Sourcing Costs (COGS)</span>
                      <span>-${pnl.cogs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>EBay Final Value Fees</span>
                      <span>-${pnl.ebayFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Outbound Shipping & Labels</span>
                      <span>-${pnl.shippingCosts.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-md pt-4 border-t border-white/5">
                    <span className="text-gray-400 font-bold italic">Gross Inventory Profit</span>
                    <span className="text-emerald-400 font-bold">${pnl.grossProfit.toLocaleString()}</span>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">Operational Overhead (Ledger)</span>
                      <span className="text-rose-400 font-bold">-${pnl.operationalOverhead.toLocaleString()}</span>
                    </div>
                    <div className="pl-4 space-y-2 border-l-2 border-white/5">
                      {Object.entries(stats.byCategory).map(([cat, amount]) => (
                        <div key={cat} className="flex justify-between items-center text-xs text-gray-500">
                          <span>{cat}</span>
                          <span>-${amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-3xl pt-8 border-t-2 border-white/10">
                    <span className="text-white font-black">Net Business Income</span>
                    <span className="text-emerald-400 font-black">${pnl.netBusinessIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </ViewContainer>
  );
};

export default LedgerView;
