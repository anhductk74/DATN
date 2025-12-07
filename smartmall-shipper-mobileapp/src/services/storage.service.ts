import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '../types/auth.types';

const TOKEN_KEY = '@smartmall_access_token';
const REFRESH_TOKEN_KEY = '@smartmall_refresh_token';
const USER_INFO_KEY = '@smartmall_user_info';

class StorageService {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      console.log('StorageService: Saving tokens...');
      await AsyncStorage.multiSet([
        [TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
      console.log('StorageService: Tokens saved successfully');
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async saveUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      console.log('StorageService: Saving user info...');
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      console.log('StorageService: User info saved successfully');
    } catch (error) {
      console.error('Error saving user info:', error);
      throw error;
    }
  }

  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoString = await AsyncStorage.getItem(USER_INFO_KEY);
      return userInfoString ? JSON.parse(userInfoString) : null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
