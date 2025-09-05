'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { mockLogin } from '@/lib/mockAuth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  getRoleDisplayName: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null
  });

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('planmate_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState(prev => ({ ...prev, user }));
      } catch (error) {
        localStorage.removeItem('planmate_user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await mockLogin(credentials.email, credentials.password);
      localStorage.setItem('planmate_user', JSON.stringify(user));
      setAuthState({
        user,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('planmate_user');
    setAuthState({
      user: null,
      isLoading: false,
      error: null
    });
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!authState.user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[authState.user.role];
    const resourcePermission = rolePermissions.find(p => p.resource === resource);
    
    return resourcePermission ? resourcePermission.actions.includes(action) : false;
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.PROJECT_MANAGER]: 'Project Manager',
      [UserRole.TEAM_LEAD]: 'Team Lead',
      [UserRole.TEAM_MEMBER]: 'Team Member'
    };
    return roleNames[role];
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission,
    getRoleDisplayName
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
