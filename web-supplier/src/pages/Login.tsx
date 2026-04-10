import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supplierApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await supplierApi.login(formData);
            login(data.user, data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, rgba(167, 139, 250, 0.1), transparent), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent)'
        }}>
            <div className="animate-fade" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
                <div className="glass-panel" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
                    <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            background: 'var(--accent-primary)', 
                            borderRadius: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 8px 32px rgba(167, 139, 250, 0.3)'
                        }}>
                            <LogIn color="white" size={32} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Supplier Portal</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Please login to manage your tenders.</p>
                    </header>

                    {error && (
                        <div style={{ 
                            padding: '16px', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            borderRadius: '12px', 
                            color: '#ef4444', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '24px',
                            fontSize: '0.9rem'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="email" 
                                    className="input-field" 
                                    style={{ paddingLeft: '48px' }}
                                    placeholder="name@company.com"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
                                <a href="#" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    style={{ paddingLeft: '48px' }}
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="premium-btn" 
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', height: '52px', fontSize: '1.1rem', marginTop: '8px' }}
                        >
                            {loading ? 'Logging in...' : (
                                <>Sign In <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <footer style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have a business account?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
