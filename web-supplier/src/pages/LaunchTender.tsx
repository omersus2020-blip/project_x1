import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Tag, Plus, Percent, Users, X } from 'lucide-react';
import { supplierApi } from '../lib/api';

const LaunchTender = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    originalPrice: '',
    targetParticipants: '',
    endDate: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
  });

  const [tiers, setTiers] = useState([
    { minParticipants: 50, discountPercent: 10 },
    { minParticipants: 100, discountPercent: 20 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For now, using a hardcoded supplierId. In a real app, this would come from auth context.
      const supplierId = "mock-supplier-id-123"; 
      
      await supplierApi.createTender({
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        targetParticipants: parseInt(formData.targetParticipants),
        endDate: new Date(formData.endDate).toISOString(),
        supplierId
      });
      
      alert('Tender proposed successfully! Waiting for admin approval.');
      navigate('/');
    } catch (err: any) {
      alert(`Error submitting tender: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    setTiers([...tiers, { minParticipants: 0, discountPercent: 0 }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: string, value: string) => {
    const newTiers = [...tiers];
    (newTiers[index] as any)[field] = parseInt(value) || 0;
    setTiers(newTiers);
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Launch New Tender</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Fill in the details to propose a new group-buy tender. It will go live after admin approval.</p>
      </header>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Basic Info */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} color="var(--accent-primary)" /> Basic Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Title</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Ninja Air Fryer AF100" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
              <textarea 
                className="input-field" 
                style={{ minHeight: '100px', resize: 'vertical' }} 
                placeholder="Describe the product features, warranty, etc."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
              <select 
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Electronics</option>
                <option>Kitchen</option>
                <option>Home</option>
                <option>Groceries</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>End Date</label>
              <input 
                type="date" 
                className="input-field"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

        {/* Pricing & Tiers */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={20} color="var(--accent-primary)" /> Pricing & Discounts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Retail Price (₪)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0.00" 
                value={formData.originalPrice}
                onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Target Participants</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0" 
                value={formData.targetParticipants}
                onChange={(e) => setFormData({...formData, targetParticipants: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Discount Tiers</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tiers.map((tier, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0 12px' }}>
                    <Users size={16} color="var(--text-muted)" />
                    <input 
                      type="number" 
                      placeholder="Min Users" 
                      className="input-field" 
                      style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                      value={tier.minParticipants}
                      onChange={(e) => updateTier(index, 'minParticipants', e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0 12px' }}>
                    <Percent size={16} color="var(--text-muted)" />
                    <input 
                      type="number" 
                      placeholder="Discount %" 
                      className="input-field" 
                      style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                      value={tier.discountPercent}
                      onChange={(e) => updateTier(index, 'discountPercent', e.target.value)}
                    />
                  </div>
                  <button onClick={() => removeTier(index)} style={{ color: '#ef4444', padding: '8px' }}><X size={20} /></button>
                </div>
              ))}
              <button 
                onClick={addTier}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--accent-primary)',
                  fontSize: '0.875rem',
                  padding: '8px',
                  marginTop: '4px'
                }}
              >
                <Plus size={16} /> Add Another Tier
              </button>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          className="premium-btn" 
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', marginTop: '16px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Submitting...' : 'Submit Tender Proposal'}
        </button>
        </form>
      </div>
    </div>
  );
};

export default LaunchTender;
