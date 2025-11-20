import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '../services';
import apiClient from '../lib/apiClient';
import { UserInfoDto, LoginRequestDto, RegisterRequestDto } from '../types';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: UserInfoDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequestDto) => Promise<void>;
  register: (userData: RegisterRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google OAuth configuration
  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  // Load user info from storage on app start
  useEffect(() => {
    loadUserInfo();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  const loadUserInfo = async () => {
    try {
      const userInfo = await apiClient.getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequestDto) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      const { accessToken, refreshToken, userInfo } = response.data;

      await apiClient.setAuthTokens(accessToken, refreshToken);
      await apiClient.setUserInfo(userInfo);
      setUser(userInfo);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequestDto) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      const { accessToken, refreshToken, userInfo } = response.data;

      await apiClient.setAuthTokens(accessToken, refreshToken);
      await apiClient.setUserInfo(userInfo);
      setUser(userInfo);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const response = await authService.googleAuth({ idToken: accessToken });
      const { accessToken: apiAccessToken, refreshToken, userInfo } = response.data;

      await apiClient.setAuthTokens(apiAccessToken, refreshToken);
      await apiClient.setUserInfo(userInfo);
      setUser(userInfo);
    } catch (error: any) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google OAuth failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await apiClient.clearAuth();
      setUser(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
