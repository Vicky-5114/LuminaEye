'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'blind' | 'volunteer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  glassesId?: string;
  email?: string;
}

interface RoleContextType {
  role: UserRole | null;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('lumina_user');
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      setRole(parsed.role);
    }
  }, []);

  const login = (newUser: User) => {
    sessionStorage.setItem('lumina_user', JSON.stringify(newUser));
    sessionStorage.setItem('lumina_role', newUser.role);
    setUser(newUser);
    setRole(newUser.role);
  };

  const logout = () => {
    sessionStorage.removeItem('lumina_user');
    sessionStorage.removeItem('lumina_role');
    setUser(null);
    setRole(null);
  };

  return (
    <RoleContext.Provider value={{ role, user, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
