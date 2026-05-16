import React from 'react';
import './StoreView.css';
import { ViewContainer, ViewHeader, KpiBar, KpiCard } from '../components/layout/ViewLayout';
import { DollarSign, BarChart3, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ListItemProps {
  image: string;
  title: string;
  subtitle: string;
  price: string;
}

const ListItem: React.FC<ListItemProps> = ({ image, title, subtitle, price }) => (
  <div className="list-item">
    <img src={image} alt={title} className="item-thumb" />
    <div className="item-info">
      <span className="item-title">{title}</span>
      <span className="item-subtitle">{subtitle}</span>
    </div>
    <span className="item-price">{price}</span>
  </div>
);

const StoreView: React.FC = () => {
  // Mock data
  const activeListings = [
    { id: 1, title: 'Vintage Rolex Submariner 16610', price: '$9,500.00', impressions: '12.4k', views: '842', cartAdditions: '12', watchers: '45' },
    { id: 2, title: 'Sony PlayStation 5 Console - Disc Edition', price: '$499.00', impressions: '45.2k', views: '2,105', cartAdditions: '84', watchers: '156' },
    { id: 3, title: 'Apple MacBook Pro 14" M3 Pro', price: '$1,999.00', impressions: '8.1k', views: '420', cartAdditions: '5', watchers: '28' },
    { id: 4, title: 'Nikon Z9 Mirrorless Camera Body', price: '$5,496.00', impressions: '3.2k', views: '156', cartAdditions: '2', watchers: '14' },
    { id: 5, title: 'LEGO Star Wars Millennium Falcon 75192', price: '$849.99', impressions: '15.7k', views: '930', cartAdditions: '18', watchers: '67' },
  ];

  const pendingShipments = [
    { id: 1, image: 'https://via.placeholder.com/40', title: 'Bose QC45 Headphones', subtitle: 'Order #8492 - John Doe', price: '$329.00' },
    { id: 2, image: 'https://via.placeholder.com/40', title: 'Logitech MX Master 3S', subtitle: 'Order #8493 - Jane Smith', price: '$99.00' },
  ];

  const recentlySold = [
    { id: 1, image: 'https://via.placeholder.com/40', title: 'iPad Pro 11-inch M2', subtitle: 'Sold 2h ago', price: '$799.00' },
    { id: 2, image: 'https://via.placeholder.com/40', title: 'AirPods Pro (2nd Gen)', subtitle: 'Sold 5h ago', price: '$249.00' },
    { id: 3, image: 'https://via.placeholder.com/40', title: 'Kindle Paperwhite', subtitle: 'Sold 1d ago', price: '$139.00' },
  ];

  return (
    <ViewContainer className="store-view">
      <ViewHeader 
        title="Store Dashboard" 
        subtitle="EBay inventory and performance analytics."
      />

      <KpiBar>
        <KpiCard 
          icon={<DollarSign size={24} />} 
          label="Total Inventory Value" 
          value="$142,580" 
          secondaryValue={<span className="text-emerald-500 flex items-center gap-1"><ArrowUpRight size={14}/> 5.2%</span>}
        />
        <KpiCard 
          icon={<BarChart3 size={24} />} 
          label="Sales (30d)" 
          value="$12,450" 
          secondaryValue={<span className="text-emerald-500 flex items-center gap-1"><ArrowUpRight size={14}/> 12.1%</span>}
        />
        <KpiCard 
          icon={<PieChart size={24} />} 
          label="Sales (90d)" 
          value="$38,200" 
          secondaryValue={<span className="text-rose-500 flex items-center gap-1"><ArrowDownRight size={14}/> 2.4%</span>}
        />
        <KpiCard 
          icon={<Calendar size={24} />} 
          label="Sales (YTD)" 
          value="$156,840" 
          secondaryValue={<span className="text-emerald-500 flex items-center gap-1"><ArrowUpRight size={14}/> 18.5%</span>}
        />
      </KpiBar>

      <section className="middle-section">
        <div className="glass-panel shipment-panel">
          <div className="panel-header">
            <h3>Pending Shipment</h3>
            <span className="badge">{pendingShipments.length}</span>
          </div>
          <div className="list-container">
            {pendingShipments.map(item => <ListItem key={item.id} {...item} />)}
          </div>
        </div>
        <div className="glass-panel sold-panel">
          <div className="panel-header">
            <h3>Recently Sold</h3>
          </div>
          <div className="list-container">
            {recentlySold.map(item => <ListItem key={item.id} {...item} />)}
          </div>
        </div>
      </section>

      <section className="bottom-section">
        <div className="glass-panel active-listings-panel">
          <div className="panel-header">
            <h3>Active Listings</h3>
            <button className="small-btn">View All</button>
          </div>
          <table className="dense-grid">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Impressions</th>
                <th>Views</th>
                <th>Cart Additions</th>
                <th>Watchers</th>
              </tr>
            </thead>
            <tbody>
              {activeListings.map(item => (
                <tr key={item.id}>
                  <td className="title-cell" title={item.title}>{item.title}</td>
                  <td className="bold">{item.price}</td>
                  <td>{item.impressions}</td>
                  <td>{item.views}</td>
                  <td>{item.cartAdditions}</td>
                  <td>{item.watchers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ViewContainer>
  );
};

export default StoreView;

