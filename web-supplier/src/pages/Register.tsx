import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft, 
  CreditCard, 
  MapPin, 
  User, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supplierApi } from '../lib/api';

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyNumber: '',
    businessSector: 'Electronics',
    bankAccount: '',
    businessAddress: '',
    contactName: '',
    contactPhone: ''
  });
  
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await supplierApi.register(formData);
      // Redirect to OTP verification with userId
      navigate('/verify', { state: { userId: response.userId, email: response.email } });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setStep(1); // Go back to fix account info if it fails
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-primary)'
    }}>
      {/* Progress Bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', width: '100%' }}>
        <div style={{ 
          height: '100%', 
          background: 'var(--accent-primary)', 
          width: `${progress}%`,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 8px var(--accent-primary)'
        }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="animate-fade" style={{ width: '100%', maxWidth: '520px' }}>
          <div className="glass-panel" style={{ padding: '48px' }}>
            <header style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Step {step} of 3
                </span>
                {step > 1 && (
                  <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                {step === 1 && "Create Account"}
                {step === 2 && "Business Identity"}
                {step === 3 && "Final Details"}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {step === 1 && "Start by setting up your login credentials."}
                {step === 2 && "Tell us about your legal business entity."}
                {step === 3 && "Provide settlement and contact information."}
              </p>
            </header>

            {error && (
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444', marginBottom: '24px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Full Name / Profile Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" required className="input-field" style={{ paddingLeft: '48px' }}
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Work Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" required className="input-field" style={{ paddingLeft: '48px' }}
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" required className="input-field" style={{ paddingLeft: '48px' }} minLength={6}
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Company ID / Registration Number</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" required className="input-field" style={{ paddingLeft: '48px' }}
                        value={formData.companyNumber} onChange={e => setFormData({...formData, companyNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Business Sector</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select 
                        className="input-field" style={{ paddingLeft: '48px' }}
                        value={formData.businessSector} onChange={e => setFormData({...formData, businessSector: e.target.value})}
                      >
                        <option value="Electronics">Electronics & Tech</option>
                        <option value="Food">Food & Groceries</option>
                        <option value="Kitchen">Kitchen & Home</option>
                        <option value="Logistics">Logistics & Service</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Business Address</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <textarea 
                        required className="input-field" style={{ paddingLeft: '48px', minHeight: '80px', resize: 'none' }}
                        value={formData.businessAddress} onChange={e => setFormData({...formData, businessAddress: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Bank Account (Settlement)</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" required className="input-field" style={{ paddingLeft: '48px' }}
                        value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Contact Person</label>
                      <input 
                        type="text" required className="input-field"
                        value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Contact Phone</label>
                      <input 
                        type="text" required className="input-field"
                        value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', gap: '12px', fontSize: '0.875rem' }}>
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                    <p>By clicking register, you agree to our terms of service for suppliers.</p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="premium-btn" 
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', height: '52px', fontSize: '1.1rem', marginTop: '32px' }}
              >
                {loading ? 'Processing...' : (
                  <>
                    {step === 3 ? 'Complete Registration' : 'Continue'} 
                    <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                  </>
                )}
              </button>
            </form>

            <footer style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
