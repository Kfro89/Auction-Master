import React, { useState, useEffect } from 'react';
import './FulfillmentView.css';

interface FulfillmentItem {
    id: number;
    title: string;
    storage_location: string;
    packaging_config: string;
}

export const FulfillmentView: React.FC = () => {
    const [items, setItems] = useState<FulfillmentItem[]>([]);
    const [reconcilingItem, setReconcilingItem] = useState<FulfillmentItem | null>(null);
    const [finalFees, setFinalFees] = useState<string>('');
    const [finalShipping, setFinalShipping] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/inventory/sold-queue')
            .then(res => res.json())
            .then(data => setItems(data));
    }, []);

    const openModal = (item: FulfillmentItem) => {
        setReconcilingItem(item);
        setFinalFees('');
        setFinalShipping('');
    };

    const closeModal = () => {
        setReconcilingItem(null);
    };

    const handleConfirm = async () => {
        if (!reconcilingItem) return;
        setIsSubmitting(true);
        try {
            const feesNum = parseFloat(finalFees) || 0;
            const shippingNum = parseFloat(finalShipping) || 0;
            const res = await fetch(`/api/inventory/${reconcilingItem.id}/reconcile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    final_fees: feesNum,
                    final_shipping: shippingNum
                })
            });
            if (res.ok) {
                setItems(prev => prev.filter(i => i.id !== reconcilingItem.id));
                closeModal();
            } else {
                console.error('Failed to reconcile item');
            }
        } catch (err) {
            console.error('Error reconciling:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="saas-container">
            <h1 className="saas-header">Fulfillment Queue</h1>
            <div className="saas-card-grid">
                {items.map((item) => (
                    <div key={item.id} className="saas-card">
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#111827' }}>{item.title}</h3>
                        <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px' }}>Location: {item.storage_location}</p>
                        <p style={{ margin: '0 0 20px 0', color: '#4b5563', fontSize: '14px' }}>Packaging: {item.packaging_config}</p>
                        <button className="saas-btn" onClick={() => openModal(item)}>Reconcile & Archive</button>
                    </div>
                ))}
            </div>

            {reconcilingItem && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
                    }}>
                        <h2 style={{
                            margin: '0 0 24px 0',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            color: '#111827',
                            fontSize: '24px'
                        }}>Reconcile & Archive</h2>
                        
                        <p style={{
                            marginBottom: '32px',
                            color: '#6b7280',
                            fontSize: '15px',
                            lineHeight: '1.5'
                        }}>
                            Confirm final expenses for <strong style={{ color: '#111827' }}>{reconcilingItem.title}</strong> before archiving.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#374151'
                            }}>
                                Actual Final eBay Fees ($)
                            </label>
                            <input 
                                type="number"
                                value={finalFees}
                                onChange={e => setFinalFees(e.target.value)}
                                placeholder="0.00"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.15s ease',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#374151'
                            }}>
                                Actual Shipping Cost ($)
                            </label>
                            <input 
                                type="number"
                                value={finalShipping}
                                onChange={e => setFinalShipping(e.target.value)}
                                placeholder="0.00"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.15s ease',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button 
                                onClick={closeModal}
                                disabled={isSubmitting}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    color: '#374151',
                                    fontWeight: 500,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.15s ease'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4f46e5',
                                    border: '1px solid transparent',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    fontWeight: 500,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.15s ease'
                                }}
                            >
                                {isSubmitting ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
