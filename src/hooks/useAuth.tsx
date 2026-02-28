'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '@/services/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('aura-auth-token');
      if (token) {
        const response = await userService.getProfile();
        if (response.data) {
          setUser(response.data);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const response = await userService.login(username, password);
    if (response.data) {
      localStorage.setItem('aura-auth-token', response.data.token);
      setUser(response.data.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await userService.logout();
    localStorage.removeItem('aura-auth-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
