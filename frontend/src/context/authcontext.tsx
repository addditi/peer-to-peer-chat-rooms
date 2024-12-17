import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, AuthContextType } from '../types/mod';
import { authService } from '../services/authservice';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const newUser = await authService.register(username, email, password);
      setUser(newUser);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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