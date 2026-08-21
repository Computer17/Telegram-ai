import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
}

const defaultAdminUser: UserProfile = {
  id: 'demo-user-1',
  email: 'kshakilrana2030@gmail.com',
  displayName: 'Shakil Rana',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'superadmin',
  status: 'active',
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ai_tg_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultAdminUser;
      }
    }
    return defaultAdminUser;
  });

  useEffect(() => {
    localStorage.setItem('ai_tg_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUserRole = (newRole: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      displayName:
        newRole === 'superadmin'
          ? 'Shakil Rana (Superadmin)'
          : newRole === 'admin'
          ? 'Sarah Jenkins (Admin)'
          : 'Regular User Account',
      email:
        newRole === 'superadmin'
          ? 'kshakilrana2030@gmail.com'
          : newRole === 'admin'
          ? 'admin@telegram-ai.io'
          : 'user@telegram-ai.io',
      updatedAt: new Date().toISOString(),
    }));
  };

  const logout = () => {
    switchUserRole('user');
  };

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
  const isSuperAdmin = currentUser.role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        isAdmin,
        isSuperAdmin,
        switchUserRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
