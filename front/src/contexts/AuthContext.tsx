import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'manager' | 'user' | null;
  login: (token: string, role: 'admin' | 'manager' | 'user') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'user' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole') as 'admin' | 'manager' | 'user' | null;
      
      if (token && role) {
        try {
          // Проверяем валидность токена
          const response = await axios.get('/api/v1/auth/verify');
          if (response.status === 200) {
            setIsAuthenticated(true);
            setUserRole(role);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // Если токен невалиден, очищаем localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
          }
        } catch (error) {
          // В случае ошибки, очищаем localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, role: 'admin' | 'manager' | 'user') => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
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