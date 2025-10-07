"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services';

interface EnhancedUserProfile {
  id?: string;
  fullName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  isActive?: boolean;
}

interface UserProfileContextType {
  userProfile: EnhancedUserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, status } = useAuth();
  const [userProfile, setUserProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      setUserProfile(null);
      return;
    }

    setLoading(true);
    try {
      const response = await userService.getUserProfile();
      
      if (response.status === 200 && response.data) {
        const userData = response.data;
        const newProfile = {
          id: userData.id,
          fullName: userData.fullName,
          email: userData.username, // Backend uses username as email
          username: userData.username,
          phoneNumber: userData.phoneNumber,
          avatar: userData.avatar,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          isActive: userData.isActive,
        };
        setUserProfile(newProfile);
      } else {
        // Fallback to session data
        console.log('⚠️ API failed, using session fallback');
        setUserProfile({
          fullName: session.user.fullName || undefined,
          email: session.user.email || undefined,
          username: session.user.username || undefined,
          phoneNumber: session.user.phoneNumber || undefined,
          avatar: session.user.avatar || undefined,
          dateOfBirth: session.user.dateOfBirth || undefined,
          gender: session.user.gender || undefined,
          isActive: session.user.isActive || undefined,
        });
      }
    } catch (error) {
      console.error('❌ Load user profile error:', error);
      // Fallback to session data on error
      setUserProfile({
        fullName: session.user.fullName || undefined,
        email: session.user.email || undefined,
        username: session.user.username || undefined,
        phoneNumber: session.user.phoneNumber || undefined,
        avatar: session.user.avatar || undefined,
        dateOfBirth: session.user.dateOfBirth || undefined,
        gender: session.user.gender || undefined,
        isActive: session.user.isActive || undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const refreshProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};