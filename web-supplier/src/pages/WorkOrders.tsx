import { Truck, MapPin, Package as PackageIcon, Download, CheckCircle2, Clock } from 'lucide-react';

const WorkOrders = () => {
  const activeOrders = [
    { 
      id: '#398', 
      tender: 'Florentine Neighborhood (Milk)', 
      units: 65, 
      status: 'Ready for Pickup',
      deadline: 'Today, 18:00',
      destination: 'Florentine 12, Tel Aviv'
    },
    { 
      id: '#395', 
      tender: 'Ramat Gan (Eggs/Bread)', 
      units: 110, 
      status: 'In Transit',
      deadline: 'Tomorrow, 09:00',
      destination: 'Bialik 5, Ramat Gan'
    }
  ];

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Work Orders & Logistics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage fulfillment and delivery schedules for won tenders.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {activeOrders.map((order, index) => (
          <div key={index} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', borderRadius: '8px' }}>
                  <PackageIcon size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>{order.tender}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order ID: {order.id}</p>
                </div>
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                padding: '4px 10px', 
                borderRadius: '12px', 
                background: order.status === 'In Transit' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: order.status === 'In Transit' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                fontWeight: 600,
                alignSelf: 'start'
              }}>
                {order.status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <Truck size={16} /> <strong>{order.units}</strong> Items to fulfill
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} /> {order.destination}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <Clock size={16} /> Deadline: <span style={{ color: '#ef4444' }}>{order.deadline}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="input-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--bg-tertiary)', fontSize: '0.875rem' }}>
                <Download size={16} /> Labels
              </button>
              <button className="premium-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> Mark Shipped
              </button>
            </div>
          </div>
        ))}

        <div className="glass-panel" style={{ border: '2px dashed var(--border-subtle)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', cursor: 'pointer' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <PlusCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>Scanning for new wins...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlusCircle = ({ size, style }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default WorkOrders;
