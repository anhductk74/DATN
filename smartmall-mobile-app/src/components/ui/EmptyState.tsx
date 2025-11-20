import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = 'cart-outline',
  title = 'Không có dữ liệu',
  message = 'Chưa có thông tin để hiển thị'
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={80} color="#d1d5db" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
