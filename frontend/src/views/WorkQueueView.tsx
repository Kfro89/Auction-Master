import React, { useState, useEffect } from 'react';
import './WorkQueueView.css';
import { ViewContainer, ViewHeader } from '../components/layout/ViewLayout';
import { 
  ImageIcon, Sparkles, Check, PackageOpen, 
  Truck, MapPin, Printer, Wrench, Layout, ChevronRight,
  ClipboardCheck, Package, Receipt, Boxes
} from 'lucide-react';
import CostLineItemLedger from '../components/CostLineItemLedger';

type WorkQueueStatus = 'WON' | 'PAID' | 'TRANSIT_VENDOR' | 'TRANSIT_LOCAL' | 'RECEIVED' | 'REFURBISH' | 'STAGING' | 'READY_TO_LIST' | 'listed' | 'sold';

interface CostLineItem {
  id: number;
  label: string;
  amount: number;
  category: string;
  created_at: string;
}

interface InventoryItem {
  id: number;
  barcode: string;
  title: string;
  drafted_title: string;
  drafted_description: string;
  ebay_category_id: string;
  buy_price: number;
  estimated_price: number;
  images: string[];
  status: WorkQueueStatus;
  created_at: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  anti_tamper_tag?: string;
  storage_location?: string;
  tracking_number?: string;
  shipping_method?: string;
  local_pickup_address?: string;
  local_pickup_deadline?: string;
  qr_code_url?: string;
  cost_line_items?: CostLineItem[];
}

const STAGES: { id: WorkQueueStatus; label: string; icon: any }[] = [
  { id: 'WON', label: 'Won', icon: ClipboardCheck },
  { id: 'PAID', label: 'Paid', icon: Receipt },
  { id: 'TRANSIT_VENDOR', label: 'In Transit', icon: Truck },
  { id: 'RECEIVED', label: 'Received', icon: MapPin },
  { id: 'REFURBISH', label: 'Refurbish', icon: Wrench },
  { id: 'STAGING', label: 'Staging', icon: Layout },
  { id: 'READY_TO_LIST', label: 'Ready', icon: Check }
];

const WorkQueueView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<WorkQueueStatus>('WON');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [autoPackaging, setAutoPackaging] = useState(false);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory/');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateItem = async (id: number, data: Partial<InventoryItem>) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
        if (selectedItem?.id === id) setSelectedItem(updatedItem);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleAddCost = async (itemId: number, label: string, amount: number, category: string) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, amount, category }),
      });
      if (response.ok) {
        const costs = await response.json();
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, cost_line_items: costs } : item
        ));
        if (selectedItem?.id === itemId) {
          setSelectedItem(prev => prev ? { ...prev, cost_line_items: costs } : null);
        }
      }
    } catch (error) {
      console.error('Failed to add cost:', error);
    }
  };

  const handlePrintLabel = async (id: number) => {
    try {
      const response = await fetch(`/api/inventory/${id}/label`, { method: 'POST' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `label-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Label print failed:', error);
    }
  };

  const handleAutoPackage = async (id: number) => {
    setAutoPackaging(true);
    try {
      const response = await fetch(`/api/inventory/${id}/auto-package`, { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          alert(`Selected: ${result.package_name} ($${result.cost})`);
          await fetchInventory(); // Refresh to get updated costs
        } else {
          alert('No fitting package found.');
        }
      }
    } catch (error) {
      console.error('Auto-package failed:', error);
    } finally {
      setAutoPackaging(false);
    }
  };

  const handleGenerateDraft = async (id: number) => {
    setDrafting(true);
    try {
      const response = await fetch(`/api/inventory/${id}/draft`, { method: 'POST' });
      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
        setSelectedItem(updatedItem);
      }
    } catch (error) {
      console.error('Drafting failed:', error);
    } finally {
      setDrafting(false);
    }
  };

  const stageItems = items.filter(it => it.status === activeStage);

  if (loading) return <div className="loading">Loading work queue...</div>;

  return (
    <ViewContainer className="work-queue-view">
      <ViewHeader 
        title="Work Queue" 
        subtitle="Manage inventory through the post-acquisition lifecycle."
      />

      <div className="stage-navigator glass mb-6">
        {STAGES.map(stage => {
          const count = items.filter(it => it.status === stage.id).length;
          return (
            <button 
              key={stage.id} 
              className={`stage-btn ${activeStage === stage.id ? 'active' : ''}`}
              onClick={() => {
                setActiveStage(stage.id);
                setSelectedItem(null);
              }}
            >
              <stage.icon size={18} />
              <span>{stage.label}</span>
              {count > 0 && <span className="stage-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="work-container">
        <section className="item-list glass-panel">
          <div className="list-header">
            <span>{STAGES.find(s => s.id === activeStage)?.label} Items</span>
            <span className="count-badge">{stageItems.length}</span>
          </div>
          <div className="items-scroll">
            {stageItems.map(item => (
              <div 
                key={item.id} 
                className={`queue-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="item-main">
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <span className="item-meta mono">{item.barcode || `INV-${item.id}`} | {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-30" />
              </div>
            ))}
            {stageItems.length === 0 && (
              <div className="p-8 text-center text-gray-500 italic">No items in this stage.</div>
            )}
          </div>
        </section>

        <section className="staging-panel glass-panel">
          {selectedItem ? (
            <div className="staging-content">
              <div className="staging-header">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                  <span className="status-badge">{selectedItem.status}</span>
                </div>
                <div className="staging-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => {
                      const currentIndex = STAGES.findIndex(s => s.id === selectedItem.status);
                      if (currentIndex < STAGES.length - 1) {
                        handleUpdateItem(selectedItem.id, { status: STAGES[currentIndex + 1].id });
                      }
                    }}
                  >
                    Next Stage: {STAGES[STAGES.findIndex(s => s.id === selectedItem.status) + 1]?.label || 'Done'} <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="staging-grid">
                <div className="staging-left space-y-6">
                  {/* Stage-Specific Components */}
                  
                  {(selectedItem.status === 'WON' || selectedItem.status === 'PAID') && (
                    <div className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/20">
                      <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        <Receipt size={16} /> Acquisition Logic
                      </h3>
                      <div className="space-y-4">
                        <div className="field-group">
                          <label className="text-xs text-gray-400">Payment Status</label>
                          <div className="flex gap-2 mt-1">
                            <button 
                              className={`flex-1 py-2 rounded text-xs border ${selectedItem.status === 'PAID' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                              onClick={() => handleUpdateItem(selectedItem.id, { status: 'PAID' })}
                            >
                              Paid & Confirmed
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedItem.status === 'PAID' || selectedItem.status === 'TRANSIT_VENDOR' || selectedItem.status === 'TRANSIT_LOCAL') && (
                    <div className="glass-panel p-4 bg-blue-500/5 border-blue-500/20">
                      <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <Truck size={16} /> Logistics
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <button 
                            className={`flex-1 py-2 rounded text-xs border ${(!selectedItem.shipping_method || selectedItem.shipping_method === 'vendor') ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                            onClick={() => handleUpdateItem(selectedItem.id, { shipping_method: 'vendor' })}
                          >
                            Awaiting Vendor Shipment
                          </button>
                          <button 
                            className={`flex-1 py-2 rounded text-xs border ${(selectedItem.shipping_method === 'local') ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                            onClick={() => handleUpdateItem(selectedItem.id, { shipping_method: 'local' })}
                          >
                            Awaiting Local Pickup
                          </button>
                        </div>
                        
                        {(!selectedItem.shipping_method || selectedItem.shipping_method === 'vendor') ? (
                          <div className="field-group">
                            <label className="text-xs text-gray-400">Carrier Tracking</label>
                            <input 
                              type="text" 
                              className="frosted-input w-full mt-1"
                              placeholder="Tracking #"
                              value={selectedItem.tracking_number || ''}
                              onChange={e => handleUpdateItem(selectedItem.id, { tracking_number: e.target.value })}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="field-group">
                              <label className="text-xs text-gray-400">Physical Address</label>
                              <input 
                                type="text" 
                                className="frosted-input w-full mt-1"
                                placeholder="Pickup Address"
                                value={selectedItem.local_pickup_address || ''}
                                onChange={e => handleUpdateItem(selectedItem.id, { local_pickup_address: e.target.value })}
                              />
                            </div>
                            <div className="field-group">
                              <label className="text-xs text-gray-400">Pickup Deadline</label>
                              <input 
                                type="date" 
                                className="frosted-input w-full mt-1"
                                value={selectedItem.local_pickup_deadline ? selectedItem.local_pickup_deadline.split('T')[0] : ''}
                                onChange={e => handleUpdateItem(selectedItem.id, { local_pickup_deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                              />
                            </div>
                          </>
                        )}
                        <button 
                          className="action-btn outline w-full justify-center"
                          onClick={() => handleUpdateItem(selectedItem.id, { status: 'RECEIVED' })}
                        >
                          Mark as Received
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedItem.status === 'RECEIVED' && (
                    <div className="glass-panel p-4 bg-purple-500/5 border-purple-500/20">
                      <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <MapPin size={16} /> Intake & Labels
                      </h3>
                      <div className="space-y-4">
                        <div className="field-group">
                          <label className="text-xs text-gray-400">Storage Location (Bin/Shelf)</label>
                          <input 
                            type="text" 
                            className="frosted-input w-full mt-1"
                            placeholder="e.g. Bin 12A"
                            value={selectedItem.storage_location || ''}
                            onChange={e => handleUpdateItem(selectedItem.id, { storage_location: e.target.value })}
                          />
                        </div>
                        <button 
                          className="action-btn outline w-full justify-center gap-2"
                          onClick={() => handlePrintLabel(selectedItem.id)}
                        >
                          <Printer size={16} /> Print Thermal Label
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="action-btn outline small justify-center" onClick={() => handleUpdateItem(selectedItem.id, { status: 'REFURBISH' })}>Needs Repair</button>
                          <button className="action-btn primary small justify-center" onClick={() => handleUpdateItem(selectedItem.id, { status: 'STAGING' })}>Ready for Staging</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedItem.status === 'REFURBISH' || selectedItem.status === 'STAGING') && (
                    <CostLineItemLedger 
                      items={selectedItem.cost_line_items || []} 
                      onAddCost={(label, amount, cat) => handleAddCost(selectedItem.id, label, amount, cat)}
                    />
                  )}

                  {selectedItem.status === 'STAGING' && (
                    <div className="glass-panel p-4 bg-orange-500/5 border-orange-500/20">
                      <h3 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                        <Boxes size={16} /> Dims & Weight
                      </h3>
                      <div className="field-group mb-4">
                        <label className="text-[10px] text-gray-400">Anti-Tamper Barcode Tag</label>
                        <input 
                          type="text" 
                          className="frosted-input w-full mt-1"
                          placeholder="e.g. XYZ-123"
                          value={selectedItem.anti_tamper_tag || ''}
                          onChange={e => handleUpdateItem(selectedItem.id, { anti_tamper_tag: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="field-group">
                          <label className="text-[10px] text-gray-400">Weight (oz)</label>
                          <input 
                            type="number" 
                            className="frosted-input w-full mt-1"
                            value={selectedItem.weight || 0}
                            onChange={e => handleUpdateItem(selectedItem.id, { weight: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="field-group">
                          <label className="text-[10px] text-gray-400">Length (in)</label>
                          <input 
                            type="number" 
                            className="frosted-input w-full mt-1"
                            value={selectedItem.length || 0}
                            onChange={e => handleUpdateItem(selectedItem.id, { length: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="field-group">
                          <label className="text-[10px] text-gray-400">Width (in)</label>
                          <input 
                            type="number" 
                            className="frosted-input w-full mt-1"
                            value={selectedItem.width || 0}
                            onChange={e => handleUpdateItem(selectedItem.id, { width: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="field-group">
                          <label className="text-[10px] text-gray-400">Height (in)</label>
                          <input 
                            type="number" 
                            className="frosted-input w-full mt-1"
                            value={selectedItem.height || 0}
                            onChange={e => handleUpdateItem(selectedItem.id, { height: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <button 
                        className={`action-btn outline w-full justify-center gap-2 ${autoPackaging ? 'loading' : ''}`}
                        disabled={autoPackaging}
                        onClick={() => handleAutoPackage(selectedItem.id)}
                      >
                        {autoPackaging ? <span className="spinner"></span> : <Package size={16} />}
                        Auto-Select Packaging
                      </button>
                    </div>
                  )}
                </div>

                <div className="staging-right">
                  <div className="photo-zone glass mb-6">
                    <div className="photo-placeholder">
                      <span className="mb-2 block"><ImageIcon size={48} className="mx-auto" /></span>
                      <p>Click or drag to add photos</p>
                      <input type="file" multiple className="photo-input" />
                    </div>
                  </div>

                  <div className="field-group mb-4">
                    <label className="text-gray-400 text-sm">eBay Listing Title</label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        className="frosted-input-large flex-1"
                        maxLength={80}
                        value={selectedItem.drafted_title || ''} 
                        onChange={(e) => handleUpdateItem(selectedItem.id, { drafted_title: e.target.value })}
                        placeholder="Draft title..."
                      />
                      <button 
                        className={`action-btn primary square ${drafting ? 'loading' : ''}`}
                        onClick={() => handleGenerateDraft(selectedItem.id)}
                        disabled={drafting}
                      >
                        {drafting ? <span className="spinner"></span> : <Sparkles size={16}/>}
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="text-gray-400 text-sm">Product Description</label>
                    <textarea 
                      rows={10}
                      className="frosted-input-large w-full mt-1"
                      value={selectedItem.drafted_description || ''} 
                      onChange={(e) => handleUpdateItem(selectedItem.id, { drafted_description: e.target.value })}
                      placeholder="Product details, condition notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><PackageOpen size={64} /></div>
              <h3>Select an item to manage</h3>
              <p>Items in the {activeStage} stage are listed on the left.</p>
            </div>
          )}
        </section>
      </div>
    </ViewContainer>
  );
};

export default WorkQueueView;
