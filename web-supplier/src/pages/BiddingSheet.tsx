import { useState } from 'react';
import { TrendingDown, Info, ShieldCheck, ArrowRight } from 'lucide-react';

const BiddingSheet = () => {
  const tender = {
    id: '#402',
    title: 'Essential Dairy Basket',
    location: 'Gush Dan Region',
    items: [
      { name: 'Milk 1L (3%)', quantity: 1200, targetPrice: '₪4.10' },
      { name: 'Sliced Bread', quantity: 800, targetPrice: '₪5.50' },
      { name: 'Large Eggs (30 pack)', quantity: 450, targetPrice: '₪22.00' },
      { name: 'Cherry Tomatoes (kg)', quantity: 1500, targetPrice: '₪3.90' },
      { name: 'Canola Oil (1L)', quantity: 300, targetPrice: '₪7.20' },
    ],
    timeRemaining: '01:15:30',
    currentLowestBid: '₪23,500'
  };

  const [bids, setBids] = useState(tender.items.map(() => ''));

  const handleBidChange = (index: number, value: string) => {
    const newBids = [...bids];
    newBids[index] = value;
    setBids(newBids);
  };

  const totalBid = bids.reduce((sum, b, i) => sum + (parseFloat(b) || 0) * tender.items[i].quantity, 0);

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', marginBottom: '8px', fontSize: '0.875rem' }}>
            <TrendingDown size={16} /> Time Left: {tender.timeRemaining}
          </div>
          <h1 style={{ fontSize: '2rem' }}>Tender {tender.id} | {tender.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fulfillment for {tender.location}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Lowest Bid</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{tender.currentLowestBid}</p>
        </div>
      </header>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Item Name</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Quantity</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Target Price</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Your Price (Unit)</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {tender.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition-smooth)' }}>
                <td style={{ padding: '20px 24px', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{item.quantity} units</td>
                <td style={{ padding: '20px 24px', color: 'var(--accent-primary)' }}>{item.targetPrice} ↗</td>
                <td style={{ padding: '20px 24px' }}>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="₪ 0.00" 
                    style={{ width: '120px', padding: '8px 12px' }}
                    value={bids[index]}
                    onChange={(e) => handleBidChange(index, e.target.value)}
                  />
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 600 }}>
                  ₪ {( (parseFloat(bids[index]) || 0) * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '32px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estimated Profit</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                ₪ {(totalBid * 0.15).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>(15%)</span>
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>App Commission</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f87171' }}>
                ₪ {(totalBid * 0.1).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>(10%)</span>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Final Bid Summary</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>₪ {totalBid.toLocaleString()}</p>
            <button className="premium-btn" disabled={totalBid === 0}>
              Submit Final Offer <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Best Price Guarantee: Your bid is end-to-end encrypted until the tender closes.</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(242, 201, 76, 0.05)', borderColor: 'rgba(242, 201, 76, 0.2)' }}>
          <Info size={20} color="var(--accent-secondary)" />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Logistics: Delivery must be completed within 48h of tender completion.</p>
        </div>
      </div>
    </div>
  );
};

export default BiddingSheet;
