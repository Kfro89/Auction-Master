import React, { useState } from 'react';
import { Package, MapPin, Boxes, Check, AlertTriangle, ArrowRight, Camera } from 'lucide-react';

interface SoldOrder {
  id: number;
  ebay_order_id: string;
  title: string;
  buyer: string;
  storage_location: string;
  packaging_config: string;
  status: 'paid' | 'shipped' | 'returned';
  images: string[];
}

interface FulfillmentPaneProps {
  orders: SoldOrder[];
  onShip: (id: number) => void;
}

const FulfillmentPane: React.FC<FulfillmentPaneProps> = ({ orders, onShip }) => {
  const [selectedOrder, setSelectedOrder] = useState<SoldOrder | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  return (
    <div className="fulfillment-pane space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pick-List */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-amber-400" /> Awaiting Shipment
            </h3>
            <span className="badge bg-amber-500/20 text-amber-400">{orders.length} Orders</span>
          </div>

          <div className="space-y-3">
            {orders.map(order => (
              <div 
                key={order.id} 
                className={`order-pick-card p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedOrder?.id === order.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold text-blue-400 mono">ID: {order.ebay_order_id}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500">{order.buyer}</span>
                </div>
                <h4 className="text-white font-medium text-sm line-clamp-1 mb-3">{order.title}</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg">
                    <MapPin size={14} className="text-rose-400" />
                    <div>
                      <div className="text-[8px] uppercase text-gray-500 font-bold leading-none">Location</div>
                      <div className="text-xs text-white font-bold">{order.storage_location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg">
                    <Boxes size={14} className="text-emerald-400" />
                    <div>
                      <div className="text-[8px] uppercase text-gray-500 font-bold leading-none">Packaging</div>
                      <div className="text-xs text-white font-bold">{order.packaging_config}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Detail / Action Panel */}
        <div className="glass-panel p-6 min-h-[400px]">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">Order Fulfillment</h3>
                <button className="text-rose-400 text-xs font-bold uppercase tracking-widest hover:underline" onClick={() => setIsReturning(true)}>
                  Flag Return
                </button>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-gray-400 text-xs uppercase font-bold mb-4">Pack & Ship Checklist</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center group-hover:border-blue-400">
                      <Check size={12} className="text-blue-400 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-sm text-gray-300">Locate item in <strong>{selectedOrder.storage_location}</strong></span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center group-hover:border-blue-400">
                      <Check size={12} className="text-blue-400 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-sm text-gray-300">Prepare <strong>{selectedOrder.packaging_config}</strong></span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center group-hover:border-blue-400">
                      <Check size={12} className="text-blue-400 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-sm text-gray-300">Verify item condition matches original photos</span>
                  </label>
                </div>

                <div className="mt-8">
                  <button 
                    className="action-btn primary w-full justify-center py-4 text-lg"
                    onClick={() => onShip(selectedOrder.id)}
                  >
                    Confirm Shipment <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Package size={48} className="mb-4 opacity-20" />
              <p>Select an order from the pick-list to fulfill.</p>
            </div>
          )}
        </div>
      </div>

      {/* Return Modal (Overlay) */}
      {isReturning && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-8">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="text-rose-500" /> Anti-Tamper Verification
              </h3>
              <button className="text-gray-500 hover:text-white" onClick={() => setIsReturning(false)}>Cancel</button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Original Staging Photos */}
              <div className="flex-1 p-8 border-r border-white/5 overflow-y-auto">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-4 tracking-widest">Original Staging Photos</div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedOrder.images.map((img, i) => (
                    <img key={i} src={img} className="w-full aspect-square object-cover rounded-xl border border-white/5" alt="Original" />
                  ))}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Anti-Tamper Record</span>
                    <div className="w-16 h-16 bg-white rounded-lg mb-2"></div>
                    <span className="text-[8px] text-gray-500 mono">TAG: #AT-9428-X</span>
                  </div>
                </div>
              </div>

              {/* Right: Return Verification */}
              <div className="flex-1 p-8 bg-black/20 overflow-y-auto">
                <div className="text-[10px] uppercase font-bold text-rose-500 mb-4 tracking-widest">Returned Item Intake</div>
                <div className="space-y-6">
                  <div className="aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm font-medium">Activate Intake Camera</span>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/50">
                      <input type="checkbox" className="w-5 h-5 rounded accent-emerald-500" />
                      <span className="text-sm text-gray-300">Anti-tamper seal is intact and matches original barcode.</span>
                    </label>
                    <label className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/50">
                      <input type="checkbox" className="w-5 h-5 rounded accent-emerald-500" />
                      <span className="text-sm text-gray-300">Item physical condition matches original media intake.</span>
                    </label>
                    <label className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/50">
                      <input type="checkbox" className="w-5 h-5 rounded accent-emerald-500" />
                      <span className="text-sm text-gray-300">Serial numbers verified.</span>
                    </label>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <button className="action-btn outline w-full justify-center text-rose-400 border-rose-500/30 mb-3">
                      Report Fraud / Dispute
                    </button>
                    <button className="action-btn primary w-full justify-center py-4 bg-emerald-600 hover:bg-emerald-700">
                      Verify & Issue Refund
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FulfillmentPane;
