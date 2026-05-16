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

    useEffect(() => {
        fetch('/api/inventory/sold-queue')
            .then(res => res.json())
            .then(data => setItems(data));
    }, []);

    return (
        <div className="saas-container">
            <h1 className="saas-header">Fulfillment Queue</h1>
            <div className="saas-card-grid">
                {items.map((item) => (
                    <div key={item.id} className="saas-card">
                        <h3>{item.title}</h3>
                        <p>Location: {item.storage_location}</p>
                        <p>Packaging: {item.packaging_config}</p>
                        <button className="saas-btn">Reconcile & Archive</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
