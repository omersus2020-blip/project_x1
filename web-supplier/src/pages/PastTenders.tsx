import { FileText, Download, CheckCircle, XCircle, Filter, Calendar } from 'lucide-react';

const PastTenders = () => {
  const pastTenders = [
    { id: '#007090', date: '2022-3-22', title: 'Milk & Eggs Basket', region: 'Rishon LeZion', bid: '₪23,000', status: 'WON', category: 'Groceries' },
    { id: '#908030', date: '2022-3-22', title: 'Single Ninja Grill', region: 'Tel Aviv', bid: '₪13,000', status: 'LOST', category: 'Kitchen' },
    { id: '#907880', date: '2022-3-22', title: 'Full Dairy Basket', region: 'Haifa', bid: '₪22,000', status: 'WON', category: 'Groceries' },
    { id: '#907805', date: '2022-3-22', title: 'Oven SP101', region: 'Be' + 'er Sheva', bid: '₪27,000', status: 'WON', category: 'Kitchen' },
    { id: '#907812', date: '2022-3-22', title: 'Meat & Poultry', region: 'Modi' + 'in', bid: '₪12,000', status: 'LOST', category: 'Groceries' },
  ];

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Tender Archive</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your historical bids and performance reports.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <Filter size={18} /> Filters
          </button>
          <button className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <Calendar size={18} /> Last 6 Months
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Identify / Product</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Bid Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pastTenders.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.date}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontWeight: 600 }}>{item.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.id} • {item.region}</p>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{item.bid}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      background: item.status === 'WON' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.status === 'WON' ? 'var(--accent-primary)' : '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {item.status === 'WON' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {item.status}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button style={{ color: 'var(--text-muted)' }}><Download size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Performance Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Win Rate</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>65%</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Avg. Bid Position</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>#1.4</p>
              </div>
            </div>
            <div style={{ marginTop: '24px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              {/* Chart Placeholder */}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', border: '1px dashed var(--border-subtle)', background: 'transparent' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> Export Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="input-field" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <Download size={16} /> Monthly Revenue (PDF)
              </button>
              <button className="input-field" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <Download size={16} /> Tax Invoice Summary (Excel)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastTenders;
