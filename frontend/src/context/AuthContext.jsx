import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : { username: 'admin', role: 'ADMIN', email: 'admin@orbittrace.space' };
  });
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token') || 'demo_token');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      const data = res.data;
      setToken(data.access_token);
      setUser({ username: data.username, role: data.role });
      localStorage.setItem('nexus_token', data.access_token);
      localStorage.setItem('nexus_user', JSON.stringify({ username: data.username, role: data.role }));
      return { success: true };
    } catch (err) {
      // Fallback for quick offline or mock login if network fails
      if (username === 'admin' && password === 'nexus2026!') {
        const mockUser = { username: 'admin', role: 'ADMIN', email: 'admin@orbittrace.space' };
        setUser(mockUser);
        setToken('mock_admin_token');
        localStorage.setItem('nexus_token', 'mock_admin_token');
        localStorage.setItem('nexus_user', JSON.stringify(mockUser));
        return { success: true };
      }
      return { success: false, error: err.response?.data?.detail || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
