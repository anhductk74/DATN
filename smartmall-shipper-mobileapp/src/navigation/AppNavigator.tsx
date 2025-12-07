import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import { storageService } from '../services/storage.service';

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    console.log('AppNavigator: isAuthenticated changed to:', isAuthenticated);
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const token = await storageService.getAccessToken();
      console.log('AppNavigator: Checking auth, token exists:', !!token);
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    console.log('AppNavigator: handleLoginSuccess called');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('AppNavigator: handleLogout called');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  console.log('AppNavigator: Rendering, isAuthenticated:', isAuthenticated);

  return isAuthenticated ? (
    <HomeScreen onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
