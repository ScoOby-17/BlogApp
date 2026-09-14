import { createContext, useContext, useState, useEffect } from 'react';
import { useConfig } from './ConfigContext';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { API_BASE_URL } = useConfig();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
        withCredentials: true
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};