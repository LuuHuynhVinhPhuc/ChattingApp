import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, decodeJwt } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restore authentication from localStorage on boot
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      // Check expiration
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(savedToken);
        setUser({
          id: decoded.sub,
          name: decoded.name || decoded.preferred_username || decoded.unique_name || 'User',
          username: decoded.preferred_username || decoded.unique_name,
          email: decoded.email,
        });
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await authService.login(username, password);
      const accessToken = data.access_token;
      
      localStorage.setItem('token', accessToken);
      const decoded = decodeJwt(accessToken);
      
      setToken(accessToken);
      const loggedUser = {
        id: decoded.sub,
        name: decoded.name || decoded.preferred_username || decoded.unique_name || 'User',
        username: decoded.preferred_username || decoded.unique_name,
        email: decoded.email,
      };
      
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.error_description || err.response?.data?.error || 'Invalid credentials or connection error.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      await authService.register(username, email, password);
      // Auto login after registration
      return await login(username, password);
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.error?.message || err.response?.data?.error_description || 'Registration failed. Please check inputs.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
