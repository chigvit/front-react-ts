// shared/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/shared/api/auth/auth';

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Завантажуємо дані з localStorage при ініціалізації
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('session_token');
    const savedAuth = localStorage.getItem('isAuthenticated');

    if (savedUser && savedToken && savedAuth === 'true') {
      setUser(JSON.parse(savedUser));
      setSessionToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setSessionToken(token);
    setIsAuthenticated(true);
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('session_token', token);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    localStorage.removeItem('isAuthenticated');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      sessionToken,
      isAuthenticated,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};