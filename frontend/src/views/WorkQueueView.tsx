import React, { useState, useEffect, useRef } from 'react';
import './WorkQueueView.css';
import { Camera, ImageIcon, Sparkles, Check, PackageOpen } from 'lucide-react';
import Tooltip from '../components/Tooltip';

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
  status: 'staged' | 'drafting' | 'reviewed' | 'listed';
  created_at: string;
}

const WorkQueueView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [drafting, setDrafting] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

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
    barcodeInputRef.current?.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    
    setScanning(true);
    try {
      const response = await fetch('/api/inventory/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      if (response.ok) {
        const newItem = await response.json();
        setItems(prev => [newItem, ...prev]);
        setBarcode('');
        setSelectedItem(newItem);
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
      barcodeInputRef.current?.focus();
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

  if (loading) return <div className="loading">Loading work queue...</div>;

  return (
    <div className="work-queue-view">
      <header className="view-header">
        <div className="header-title">
          <h1>Work Queue</h1>
          <p>Stage, draft, and prepare inventory for eBay listing.</p>
        </div>
        <form className="scan-zone glass" onSubmit={handleScan}>
          <span className="scan-icon"><Camera size={20} /></span>
          <input 
            ref={barcodeInputRef}
            type="text" 
            placeholder="Scan Barcode (UPC/EAN)..." 
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={scanning}
            className="frosted-input-large"
          />
          {scanning && <span className="spinner small"></span>}
        </form>
      </header>

      <div className="work-container">
        <section className="item-list glass-panel">
          <div className="list-header">
            <span>Staged Items</span>
            <span className="count-badge">{items.length}</span>
          </div>
          <div className="items-scroll">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`queue-item ${selectedItem?.id === item.id ? 'selected' : ''} ${item.status}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="item-main">
                  <span className="item-status-dot"></span>
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <span className="item-meta mono">{item.barcode} | {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="status-label">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="staging-panel glass-panel">
          {selectedItem ? (
            <div className="staging-content">
              <div className="staging-header">
                <h2>{selectedItem.title}</h2>
                <div className="staging-actions">
                  <Tooltip text="Generate eBay Title & Description">
                    <button 
                      className={`action-btn primary ${drafting ? 'loading' : ''}`}
                      onClick={() => handleGenerateDraft(selectedItem.id)}
                      disabled={drafting || selectedItem.status === 'listed'}
                    >
                      {drafting ? <span className="spinner"></span> : <Sparkles size={16}/>} 
                      Generate AI Draft
                    </button>
                  </Tooltip>
                  {selectedItem.status !== 'reviewed' && selectedItem.status !== 'listed' && (
                    <Tooltip text="Mark as ready to list">
                      <button 
                        className="action-btn outline"
                        onClick={() => handleUpdateItem(selectedItem.id, { status: 'reviewed' })}
                      >
                        <Check size={16}/> Mark Reviewed
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="staging-grid">
                <div className="staging-left">
                  <div className="photo-zone glass">
                    <div className="photo-placeholder">
                      <span className="mb-2 block"><ImageIcon size={48} className="mx-auto" /></span>
                      <p>Click or drag to add photos</p>
                      <input type="file" multiple className="photo-input" />
                    </div>
                  </div>
                  
                  <div className="field-group">
                    <label>Est. Market Value</label>
                    <input 
                      type="number" 
                      className="frosted-input-large"
                      value={selectedItem.estimated_price || 0} 
                      onChange={(e) => handleUpdateItem(selectedItem.id, { estimated_price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="staging-right">
                  <div className="field-group">
                    <label>Drafted Title (Max 80 chars)</label>
                    <input 
                      type="text" 
                      className="frosted-input-large"
                      maxLength={80}
                      value={selectedItem.drafted_title || ''} 
                      onChange={(e) => handleUpdateItem(selectedItem.id, { drafted_title: e.target.value })}
                      placeholder="AI will generate this..."
                    />
                    <span className="char-count">{selectedItem.drafted_title?.length || 0}/80</span>
                  </div>

                  <div className="field-group">
                    <label>Product Description</label>
                    <textarea 
                      rows={12}
                      className="frosted-input-large"
                      value={selectedItem.drafted_description || ''} 
                      onChange={(e) => handleUpdateItem(selectedItem.id, { drafted_description: e.target.value })}
                      placeholder="AI will generate a professional description here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><PackageOpen size={64} /></div>
              <h3>Select an item to begin staging</h3>
              <p>Scan a barcode or pick an item from the list to manage photos and drafts.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WorkQueueView;