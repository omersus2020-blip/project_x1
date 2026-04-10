import React, { createContext, useContext, useState, useEffect } from 'react';
import { supplierApi } from './api';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  updateUser: (newData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('supplier_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await supplierApi.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (userData: any, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('supplier_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('supplier_token');
    window.location.href = '/login';
  };

  const updateUser = (newData: any) => {
    setUser((prev: any) => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
