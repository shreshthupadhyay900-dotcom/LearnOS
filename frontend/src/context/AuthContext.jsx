/* eslint-disable */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eduai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('eduai_token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (name, email, password, role = 'student') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token: t, user: u } = res.data;
    localStorage.setItem('eduai_token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('eduai_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const socialLogin = async (provider) => {
    // Mock social login flow for demo
    const mockUser = {
      _id: 'mock_social_' + Date.now(),
      name: `Elite ${provider} User`,
      email: `${provider.toLowerCase()}@eduai.io`,
      role: 'student'
    };
    const mockToken = 'mock_jwt_' + Date.now();
    
    localStorage.setItem('eduai_token', mockToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    setToken(mockToken);
    setUser(mockUser);
    return mockUser;
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

