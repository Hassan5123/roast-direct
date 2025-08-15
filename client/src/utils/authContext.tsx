"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check auth status on initial load and when localStorage might have changed
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('roastDirectAuth');
        setIsAuthenticated(authStatus === 'true');
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    // Check initial auth status
    checkAuthStatus();

    // Set up event listener for storage changes (if user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'roastDirectAuth') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Redirect if on a protected route and not authenticated
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      const protectedRoutes = ['/cart'];
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, checkingAuth, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // Store the JWT token and auth status
      localStorage.setItem('roastDirectAuth', 'true');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Handle logout locally
    localStorage.removeItem('roastDirectAuth');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}