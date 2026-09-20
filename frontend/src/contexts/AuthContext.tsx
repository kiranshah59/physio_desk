'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: {id: number, role: string}) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = Cookies.get('token');
    const storedRole = Cookies.get('role'); // We'll store role in cookie for ease
    const storedUserId = Cookies.get('user_id');

    if (storedToken && storedRole && storedUserId) {
      setToken(storedToken);
      try {
        const decoded: any = jwtDecode(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired
          logout();
        } else {
          setUser({
            id: parseInt(storedUserId),
            email: 'user', // We don't store email in token currently, but that's fine
            role: storedRole as 'admin' | 'staff',
          });
        }
      } catch (e) {
        logout();
      }
    } else if (pathname !== '/login') {
      router.push('/login');
    }
    
    setIsLoading(false);
  }, [pathname, router]);

  const login = (newToken: string, userObj: {id: number, role: string}) => {
    Cookies.set('token', newToken, { expires: 1 }); // 1 day
    Cookies.set('role', userObj.role, { expires: 1 });
    Cookies.set('user_id', userObj.id.toString(), { expires: 1 });
    
    setToken(newToken);
    setUser({
      id: userObj.id,
      email: 'user', // Placeholder
      role: userObj.role as 'admin' | 'staff'
    });
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('user_id');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
