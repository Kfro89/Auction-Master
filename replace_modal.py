import re
import sys

def replace_in_file(filename, replacement_content):
    with open(filename, 'r') as f:
        content = f.read()

    # Find the start of the modal
    start_str = '<Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} size="xl">'
    end_str = '</Modal>'

    start_idx = content.find(start_str)
    if start_idx == -1:
        print(f"Start string not found in {filename}")
        return

    # Find the matching closing tag
    # Since there might be nested Modals, wait, there aren't inside this Modal.
    # So we can just find the first </Modal> after the start_idx.
    end_idx = content.find(end_str, start_idx)
    if end_idx == -1:
        print(f"End string not found in {filename}")
        return
    end_idx += len(end_str)

    new_content = content[:start_idx] + replacement_content + content[end_idx:]

    with open(filename, 'w') as f:
        f.write(new_content)
    print(f"Replaced in {filename}")


research_replacement = """<ItemDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <>
            <div className="item-detail-kpi-tile bid">
              <div className="kpi-label">Current Bid</div>
              <div className="kpi-value">${selectedItem.current_bid?.toFixed(2)}</div>
            </div>

            <div className="detail-section">
              <h3>Bidding & Value</h3>
              <div className="detail-grid">
                {selectedItem.valuation && (
                  <>
                    <div className="detail-item">
                      <span className="label">Est. Value</span>
                      <span className="value text-emerald-500">${selectedItem.valuation.est_market_value?.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Max Bid</span>
                      <span className="value text-blue-500">${selectedItem.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="detail-section no-header">
              <div className="item-detail-bid-section-modern">
                <div className="bid-input-group">
                  <span className="currency-symbol">$</span>
                  <input 
                    type="number" 
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="modern-bid-input"
                    placeholder={`Min: $${(selectedItem.current_bid + 1).toFixed(0)}`}
                    disabled={isBidding}
                  />
                  <button 
                    className="modern-bid-btn" 
                    onClick={handlePlaceBid} 
                    disabled={isBidding || !bidAmount}
                  >
                    {isBidding ? <Loader2 size={16} className="spinning" /> : 'Bid'}
                  </button>
                </div>
                {bidError && <div className="bid-msg error">{bidError}</div>}
                {bidSuccess && <div className="bid-msg success">{bidSuccess}</div>}
              </div>

              <div className="action-row" style={{ marginTop: '12px' }}>
                <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="glass-blue-btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                  View Full Auction <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {selectedItem.valuation && (
              <div className="item-detail-kpi-tile roi">
                <div className="kpi-label">ROI</div>
                <div className="kpi-value">
                  {selectedItem.valuation.target_roi_pct ? `${Math.round(selectedItem.valuation.target_roi_pct)}%` : '--'}
                </div>
              </div>
            )}
          </>
        )}
      </ItemDetailModal>"""

watch_replacement = """<ItemDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <>
            <div className="item-detail-kpi-tile bid">
              <div className="kpi-label">Current Bid</div>
              <div className="kpi-value">${selectedItem.current_bid?.toFixed(2) || '0.00'}</div>
            </div>

            <div className="detail-section">
              <h3>Bidding & Value</h3>
              <div className="detail-grid">
                {selectedItem.valuation && (
                  <>
                    <div className="detail-item">
                      <span className="label">Est. Value</span>
                      <span className="value text-emerald-500">${selectedItem.valuation.est_market_value?.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Max Bid</span>
                      <span className="value text-blue-500">${selectedItem.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="detail-section no-header">
              <div className="action-column">
                {valuatingItems.has(selectedItem.id) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{valuationStatus[selectedItem.id] || "Loading..."}</span>
                  </div>
                ) : (
                  <button 
                    className="glass-blue-btn-small"
                    style={{ marginBottom: '12px', width: '100%', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    onClick={() => handleValuate(selectedItem.id)}
                  >
                    Re-Valuate
                  </button>
                )}
                
                <div className="action-row">
                  <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="glass-blue-btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                    View Full Auction <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {selectedItem.valuation && (
              <div className="item-detail-kpi-tile roi">
                <div className="kpi-label">ROI</div>
                <div className={`kpi-value ${getRoiValue(selectedItem.valuation, selectedItem.current_bid) > 20 ? 'high' : ''}`}>
                  {getRoiValue(selectedItem.valuation, selectedItem.current_bid) === Infinity ? '∞%' : `${Math.round(getRoiValue(selectedItem.valuation, selectedItem.current_bid)!)}%`}
                </div>
              </div>
            )}
          </>
        )}
      </ItemDetailModal>"""

replace_in_file('frontend/src/views/ResearchView.tsx', research_replacement)
replace_in_file('frontend/src/views/WatchListView.tsx', watch_replacement)
