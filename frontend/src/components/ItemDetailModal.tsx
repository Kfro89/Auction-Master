import React, { useState, useEffect } from 'react';
import './ItemDetailModal.css';
import Modal from './Modal';
import { CalendarDays, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ModalItem {
  id: number;
  title: string;
  lot_number?: string;
  current_bid?: number;
  end_time?: string | null;
  url?: string;
  image_url?: string;
  images?: string[];
  category?: string;
  tags?: any;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    search_query?: string;
    sample_size?: number;
  };
  is_watched?: boolean;
}

interface ItemDetailModalProps {
  item: ModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const CountdownTimer: React.FC<{ endTime: string | null }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('Unknown');
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      
      if (isNaN(end)) {
        setTimeLeft('Unknown');
        return;
      }

      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${secs}s`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <span>{timeLeft}</span>;
};

const normalizeTags = (tags: any): { key: string | null, value: string, fullTag: string }[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string').map(t => ({ key: null, value: t, fullTag: t }));
  if (typeof tags === 'object') {
    const result: { key: string, value: string, fullTag: string }[] = [];
    for (const [key, val] of Object.entries(tags)) {
      if (Array.isArray(val)) {
        val.forEach(v => result.push({ key, value: String(v), fullTag: `${key}: ${v}` }));
      } else if (val !== null && val !== undefined && String(val).trim() !== '') {
        result.push({ key, value: String(val), fullTag: `${key}: ${val}` });
      }
    }
    return result;
  }
  return [];
};

export const getHighResImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/\/(?:small|thumb)\//i, '/large/').replace(/[_-](?:small|thumb)(\.[a-zA-Z0-9]+)$/i, '_large$1');
};

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, isOpen, onClose, children }) => {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [item?.id]);

  if (!item) return null;

  const images = item.images && item.images.length > 0 ? item.images : (item.image_url ? [item.image_url] : []);
  const currentImage = images.length > 0 ? getHighResImageUrl(images[imageIndex]) : '';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="item-detail-layout modern">
        <div className="item-detail-image-panel-bg">
          {currentImage ? (
            <img
              src={currentImage}
              alt={item.title}
              className="item-detail-bg-image"
            />
          ) : (
            <div className="item-detail-no-image-bg">No Image Available</div>
          )}
        </div>

        <div className="item-detail-overlay-content">
          <div className="item-detail-content-columns">
            {/* Left Column: Metadata & Research */}
            <div className="item-detail-col left">
              <div className="item-detail-subtitle vertical">
                <span className="item-pill vertical time-remaining">
                  <CalendarDays size={14}/> <CountdownTimer endTime={item.end_time || null} />
                </span>
                <span className="item-pill vertical lot-number">Lot #{item.lot_number || 'N/A'}</span>
                {item.category && (
                  <span className="item-pill vertical category" title={item.category}>
                    <LayoutGrid size={14}/> <span className="truncate">{item.category}</span>
                  </span>
                )}
              </div>

              {item.valuation && (
                <div className="detail-section">
                  <h3>Research Info</h3>
                  <div className="detail-grid">
                    <div className="detail-item-custom">
                      <div className="research-query-header">Search Query</div>
                      <div className="research-query-term">{item.valuation.search_query}</div>
                    </div>
                    <div className="detail-item">
                      <span className="label">Sample Size</span>
                      <span className="value">{item.valuation.sample_size || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="item-detail-spacer"></div>

              {item.tags && normalizeTags(item.tags).length > 0 && (
                <div className="detail-section no-header">
                  <div className="tags-pill-container">
                    {normalizeTags(item.tags).map((tag, idx) => (
                      <span key={`modal-tag-${idx}`} className={`modern-tag ${tag.key ? 'structured' : ''}`}>
                        {tag.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center Column: High-Res Image & Title Overlay */}
            <div className="item-detail-col center">
              <div className="item-detail-title-card">
                <h2>{item.title}</h2>
              </div>
              <div className="gallery-container">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={item.title}
                    className="item-detail-center-image"
                  />
                ) : (
                  <div className="item-detail-no-image-bg">No Image Available</div>
                )}
                {images.length > 1 && (
                  <>
                    <button className="gallery-nav-btn left" onClick={handlePrev}><ChevronLeft size={24} /></button>
                    <button className="gallery-nav-btn right" onClick={handleNext}><ChevronRight size={24} /></button>
                    <div className="gallery-indicators">
                      {images.map((_, idx) => (
                        <span key={idx} className={`gallery-dot ${idx === imageIndex ? 'active' : ''}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Actions (Provided as Children) */}
            <div className="item-detail-col right">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ItemDetailModal;
