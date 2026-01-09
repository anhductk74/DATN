import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug helper để kiểm tra và clear AsyncStorage
 * Sử dụng trong React Native Debugger console hoặc trong code
 */

// 1. Kiểm tra tất cả keys trong AsyncStorage
export const checkAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📦 All AsyncStorage keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (key === 'token' || key === 'accessToken' || key === 'refreshToken') {
        console.log(`🔑 ${key}:`, value ? value.substring(0, 50) + '...' : 'NULL');
      } else if (key === 'userInfo') {
        console.log(`👤 ${key}:`, value ? JSON.parse(value) : 'NULL');
      } else {
        console.log(`📄 ${key}:`, value);
      }
    }
  } catch (error) {
    console.error('❌ Error checking AsyncStorage:', error);
  }
};

// 2. Clear tất cả AsyncStorage (logout hoàn toàn)
export const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared');
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage:', error);
  }
};

// 3. Clear chỉ auth data (giữ lại settings khác)
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'accessToken', 'refreshToken', 'userInfo']);
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

// 4. Manually set token (for testing)
export const setTestToken = async (token: string, userId: string) => {
  try {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('userInfo', JSON.stringify({
      id: userId,
      username: 'test',
      fullName: 'Test User',
    }));
    console.log('✅ Test token set');
  } catch (error) {
    console.error('❌ Error setting test token:', error);
  }
};

// Usage in React Native Debugger Console:
/*

import { checkAsyncStorage, clearAsyncStorage, clearAuthData } from './src/utils/asyncStorageDebug';

// Check what's in storage
checkAsyncStorage();

// Clear all
clearAsyncStorage();

// Clear only auth
clearAuthData();

*/
