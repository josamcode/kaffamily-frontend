import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { setAuthToken, setUser, getUser, logout as clearAuth } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUserState(response.data.user);
          setUser(response.data.user);
        } catch (error) {
          clearAuth();
          setUserState(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (mobile, password) => {
    try {
      const response = await api.post('/auth/login', { mobile, password });
      setAuthToken(response.data.token);
      setUser(response.data.user);
      setUserState(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في تسجيل الدخول'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في التسجيل',
        errors: error.response?.data?.errors
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setUserState(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

