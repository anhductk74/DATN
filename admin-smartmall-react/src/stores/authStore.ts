import { create } from 'zustand';
import type { UserInfo } from '../types/auth.types';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setUser: (user: UserInfo | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
    }
    set({ user, isAuthenticated: !!user });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const userInfo = localStorage.getItem('userInfo');
    const accessToken = localStorage.getItem('accessToken');
    
    if (userInfo && accessToken) {
      try {
        const user = JSON.parse(userInfo) as UserInfo;
        set({ user, isAuthenticated: true });
      } catch (error) {
        console.error('Failed to parse user info:', error);
        localStorage.clear();
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
