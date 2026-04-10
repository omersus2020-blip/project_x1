import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supplierApi } from './lib/api';
import LaunchTender from './pages/LaunchTender';
import BiddingSheet from './pages/BiddingSheet';
import PastTenders from './pages/PastTenders';
import WorkOrders from './pages/WorkOrders';
import { 
  LayoutDashboard, 
  Gavel, 
  ClipboardList, 
  Wallet, 
  Headset, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  PlusCircle,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import CompanyProfile from './pages/CompanyProfile';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ProtectedRoute from './lib/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyAccount from './pages/VerifyAccount';

// Live Dashboard Component
const Dashboard = () => {
  const [activeTenders, setActiveTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    supplierApi.getTenders()
      .then(data => {
        setActiveTenders(data.filter((t: any) => t.status === 'ACTIVE'));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tenders:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name || 'Partner'}.</p>
        </div>
        <Link to="/launch" className="premium-btn" id="launch-tender-btn">
          <PlusCircle size={20} /> Launch New Tender
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Escrow Balance</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 600 }}>₪0</p>
          <div style={{ marginTop: '16px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}></div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Available for Withdrawal</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 600 }}>₪0</p>
          <button className="premium-btn" disabled style={{ marginTop: '16px', width: '100%', justifyContent: 'center', opacity: 0.5 }}>Withdraw Funds</button>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Quality Score</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 600 }}>⭐ -- / 5</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Join tenders to build score</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ marginBottom: '24px' }}>Global Marketplace</h2>
        {loading ? (
          <p>Scanning markets...</p>
        ) : activeTenders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No live tenders found. Propose one to get started!</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {activeTenders.map((t: any) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t.title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Target: {t.targetParticipants} users • Category: {t.category}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Price</p>
                    <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>₪{t.currentPrice}</p>
                  </div>
                  <Link to="/tenders" className="premium-btn" style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
                    Place Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '280px' : '80px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '24px 16px',
        transition: 'var(--transition-smooth)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--accent-primary)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gavel size={24} color="#000" />
          </div>
          {sidebarOpen && <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>GroupSave | <span style={{ color: 'var(--accent-primary)' }}>Suppliers</span></span>}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/" active sidebarOpen={sidebarOpen} />
          <SidebarItem icon={<Gavel size={20} />} label="Open Tenders" to="/tenders" sidebarOpen={sidebarOpen} />
          <SidebarItem icon={<ClipboardList size={20} />} label="Work Orders" to="/orders" sidebarOpen={sidebarOpen} />
          <SidebarItem icon={<Wallet size={20} />} label="Finances" to="/finance" sidebarOpen={sidebarOpen} />
          <SidebarItem icon={<LayoutDashboard size={20} style={{ opacity: 0.5 }} />} label="Archive" to="/archive" sidebarOpen={sidebarOpen} />
          <SidebarItem icon={<Headset size={20} />} label="Support" to="/support" sidebarOpen={sidebarOpen} />
        </nav>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ 
            marginTop: 'auto', 
            background: 'var(--bg-tertiary)', 
            padding: '12px', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          height: '80px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(10, 14, 20, 0.5)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search tenders..." className="input-field" style={{ paddingLeft: '40px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{ position: 'relative', color: 'var(--text-secondary)' }}>
              <Bell size={22} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--accent-secondary)', borderRadius: '50%' }}></div>
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }}></div>
            
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'var(--transition-smooth)', background: profileDropdownOpen ? 'var(--bg-tertiary)' : 'transparent' }}
              >
                <div className="user-profile-info" style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || 'Loading...'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier Account</p>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent-primary)',
                  position: 'relative'
                }}>
                  <User size={20} />
                </div>
                <ChevronDown size={16} style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition-smooth)' }} />
              </div>

              {profileDropdownOpen && (
                <div className="glass-panel animate-fade" style={{ 
                  position: 'absolute', 
                  top: '120%', 
                  right: 0, 
                  width: '220px', 
                  padding: '12px', 
                  zIndex: 200,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                  <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    <Settings size={18} /> Edit Profile
                  </Link>
                  <Link to="/support" onClick={() => setProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    <Headset size={18} /> Support
                  </Link>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />
                  <button onClick={() => logout()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, active, sidebarOpen }: any) => (
  <Link 
    to={to} 
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      background: active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
      transition: 'var(--transition-smooth)',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }}
  >
    <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    {sidebarOpen && <span style={{ fontWeight: 500 }}>{label}</span>}
  </Link>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyAccount />} />

          {/* Protected Supplier Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <DesktopLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/launch" element={<LaunchTender />} />
                  <Route path="/tenders" element={<BiddingSheet />} />
                  <Route path="/orders" element={<WorkOrders />} />
                  <Route path="/archive" element={<PastTenders />} />
                  <Route path="/profile" element={<CompanyProfile />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </DesktopLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
