import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cookconnect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cookconnect_token');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('cookconnect_user', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Session restoration failed:', error);
          setUser(null);
          localStorage.removeItem('cookconnect_token');
          localStorage.removeItem('cookconnect_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('cookconnect_user', JSON.stringify(currentUser));
      return currentUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem('cookconnect_user', JSON.stringify(updated));
    return updated;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'CUSTOMER',
    isCook: user?.role === 'COOK',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

