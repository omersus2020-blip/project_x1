import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  CreditCard, 
  MapPin, 
  User, 
  Briefcase, 
  Save,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { supplierApi } from '../lib/api';

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    companyNumber: '',
    bankAccount: '',
    businessAddress: '',
    businessSector: 'Electronics',
    contactName: '',
    contactPhone: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    supplierApi.getProfile()
      .then(data => {
        // Flatten the nested supplier data into the component state
        const { supplierProfile, ...userData } = data;
        setProfile({
          ...userData,
          ...(supplierProfile || {})
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await supplierApi.updateProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p className="animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 700 }}>Company Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your business identity, contact details, and settlement information.</p>
      </header>

      {message.text && (
        <div className={`animate-fade`} style={{ 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? '#10b98133' : '#ef444433'}`
        }}>
          {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Basic Info & Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--accent-primary)" /> Basic Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Company Legal Name</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '48px' }}
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Company Email (Public)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    className="input-field" 
                    style={{ paddingLeft: '48px' }}
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Company Registration Number (VAT/ID)</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '48px' }}
                    placeholder="e.g. 512345678"
                    value={profile.companyNumber}
                    onChange={e => setProfile({...profile, companyNumber: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="var(--accent-primary)" /> Business Sector
            </h2>
            <select 
              className="input-field"
              value={profile.businessSector}
              onChange={e => setProfile({...profile, businessSector: e.target.value})}
            >
              <option value="Electronics">Electronics & Tech</option>
              <option value="Food">Food & Groceries</option>
              <option value="Kitchen">Kitchen & Home</option>
              <option value="Logistics">Logistics & Service</option>
              <option value="Other">Other</option>
            </select>
            <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>This helps us categorize your tenders in the customer app.</p>
          </section>
        </div>

        {/* Financial & Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="var(--accent-primary)" /> Settlement Details
            </h2>
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bank Account (IBAN/Number)</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '48px' }}
                  placeholder="Bank-Branch-Account"
                  value={profile.bankAccount}
                  onChange={e => setProfile({...profile, bankAccount: e.target.value})}
                />
              </div>
              <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Funds from completed tenders will be transferred here.</p>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--accent-primary)" /> Physical Address
            </h2>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <textarea 
                className="input-field" 
                style={{ paddingLeft: '48px', minHeight: '80px', resize: 'none' }}
                placeholder="Street, City, Building, Floor"
                value={profile.businessAddress}
                onChange={e => setProfile({...profile, businessAddress: e.target.value})}
              />
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--accent-primary)" /> Primary Contact Person
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="input-field"
                  value={profile.contactName}
                  onChange={e => setProfile({...profile, contactName: e.target.value})}
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  className="input-field"
                  value={profile.contactPhone}
                  onChange={e => setProfile({...profile, contactPhone: e.target.value})}
                />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            className="premium-btn" 
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem', gap: '12px' }}
          >
            {saving ? 'Saving changes...' : (
              <><Save size={20} /> Save Profile Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
