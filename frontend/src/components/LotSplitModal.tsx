import React, { useState } from 'react';
import Modal from './Modal';
import { Split, Gavel, Check } from 'lucide-react';

interface LotSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: LotSplitData) => void;
  itemTitle: string;
}

export interface LotSplitData {
  split_count: number;
  hammer_price: number;
  buyer_premium_pct: number;
  tax_rate: number;
  misc_fees: number;
  title: string;
}

const LotSplitModal: React.FC<LotSplitModalProps> = ({ isOpen, onClose, onConfirm, itemTitle }) => {
  const [data, setData] = useState<LotSplitData>({
    split_count: 1,
    hammer_price: 0,
    buyer_premium_pct: 15,
    tax_rate: 8.25,
    misc_fees: 0,
    title: itemTitle
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onConfirm(data);
  };

  const totalCost = data.hammer_price + 
                    (data.hammer_price * (data.buyer_premium_pct / 100)) + 
                    (data.hammer_price * (data.tax_rate / 100)) + 
                    data.misc_fees;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
            <Gavel size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Mark Item as Won</h2>
            <p className="text-gray-400 text-sm">Convert auction lot into inventory items.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field-group">
            <label className="text-gray-300 text-sm font-medium mb-1 block">Inventory Title</label>
            <input 
              type="text" 
              className="frosted-input-large w-full"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field-group">
              <label className="text-gray-300 text-sm font-medium mb-1 block">Hammer Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="frosted-input-large w-full"
                value={data.hammer_price}
                onChange={(e) => setData({ ...data, hammer_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="field-group">
              <label className="text-gray-300 text-sm font-medium mb-1 block">Lot Split Count</label>
              <div className="flex items-center gap-2">
                <Split size={16} className="text-blue-400" />
                <input 
                  type="number" 
                  min="1"
                  className="frosted-input-large w-full"
                  value={data.split_count}
                  onChange={(e) => setData({ ...data, split_count: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="field-group">
              <label className="text-gray-300 text-xs font-medium mb-1 block">Premium (%)</label>
              <input 
                type="number" 
                step="0.1"
                className="frosted-input-large w-full text-sm"
                value={data.buyer_premium_pct}
                onChange={(e) => setData({ ...data, buyer_premium_pct: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="field-group">
              <label className="text-gray-300 text-xs font-medium mb-1 block">Tax Rate (%)</label>
              <input 
                type="number" 
                step="0.01"
                className="frosted-input-large w-full text-sm"
                value={data.tax_rate}
                onChange={(e) => setData({ ...data, tax_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="field-group">
              <label className="text-gray-300 text-xs font-medium mb-1 block">Misc Fees ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="frosted-input-large w-full text-sm"
                value={data.misc_fees}
                onChange={(e) => setData({ ...data, misc_fees: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Total Landed COGS</span>
              <span className="text-white font-bold">${totalCost.toFixed(2)}</span>
            </div>
            {data.split_count > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Cost Per Child Item</span>
                <span className="text-blue-400 font-medium text-sm">${(totalCost / data.split_count).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="action-btn outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`action-btn primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : <Check size={18} />} 
              Confirm Acquisition
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LotSplitModal;
