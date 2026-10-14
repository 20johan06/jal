import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  loginAdmin: (credentials: { username: string; password: string }) => Promise<void>;
  loginTeam: (credentials: { teamId: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hts_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check token validity on boot
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('hts_auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const loginAdmin = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.adminLogin(credentials);
      if (res.success && res.token) {
        localStorage.setItem('hts_auth_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginTeam = async (credentials: { teamId: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.teamLogin(credentials);
      if (res.success && res.token) {
        localStorage.setItem('hts_auth_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hts_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginAdmin, loginTeam, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
