import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderService, Order } from '../services/OrderService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudinaryUrl } from '../config/config';

type OrderSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderSearch'>;
type OrderSearchScreenRouteProp = RouteProp<RootStackParamList, 'OrderSearch'>;

interface OrderSearchScreenProps {
  navigation: OrderSearchScreenNavigationProp;
  route: OrderSearchScreenRouteProp;
}

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#ff9800',
  CONFIRMED: '#2196f3',
  SHIPPING: '#9c27b0',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336',
  RETURN_REQUESTED: '#ff5722',
};

export default function OrderSearchScreen({ navigation, route }: OrderSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (userId) {
      loadOrders();
    }
  }, [userId]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, allOrders]);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setUserId(userInfo.id);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadOrders = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await orderService.getUserOrders(userId);
      if (response.success && response.data) {
        setAllOrders(response.data.content);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allOrders.filter(order => {
      // Search by shop name
      const shopNameMatch = order.shopName?.toLowerCase().includes(query);
      
      // Search by product name
      const productNameMatch = order.items.some(item => 
        item.productName.toLowerCase().includes(query)
      );

      // Search by order ID
      const orderIdMatch = order.id.toLowerCase().includes(query);

      return shopNameMatch || productNameMatch || orderIdMatch;
    });

    setFilteredOrders(filtered);
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      SHIPPING: 'Shipping',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      RETURN_REQUESTED: 'Return Requested',
    };
    return statusMap[status];
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <Text>
        {text.substring(0, index)}
        <Text style={styles.highlightedText}>
          {text.substring(index, index + query.length)}
        </Text>
        {text.substring(index + query.length)}
      </Text>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const firstItem = item.items[0];
    const remainingItems = item.items.length - 1;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderShopInfo}>
            {item.shopAvatar ? (
              <Image
                source={{ uri: item.shopAvatar.startsWith('http') ? item.shopAvatar : getCloudinaryUrl(item.shopAvatar) }}
                style={styles.shopAvatar}
              />
            ) : (
              <View style={styles.shopAvatarPlaceholder}>
                <MaterialCommunityIcons name="store" size={14} color="#2563eb" />
              </View>
            )}
            <Text style={styles.shopName}>
              {highlightText(item.shopName || 'Shop', searchQuery)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}15` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItems}>
          <View style={styles.itemRow}>
            <View style={styles.itemImageContainer}>
              {firstItem.productImage ? (
                <Image
                  source={{ uri: getCloudinaryUrl(firstItem.productImage) }}
                  style={styles.itemImage}
                />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {highlightText(firstItem.productName, searchQuery)}
              </Text>
              <Text style={styles.itemQuantity}>x{firstItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {firstItem.price.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          {remainingItems > 0 && (
            <View style={styles.moreItems}>
              <Text style={styles.moreItemsText}>
                +{remainingItems} more {remainingItems === 1 ? 'item' : 'items'}
              </Text>
            </View>
          )}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.orderTotalRow}>
            <Text style={styles.totalLabel}>Order Total:</Text>
            <Text style={styles.totalAmount}>
              {item.finalAmount?.toLocaleString('vi-VN') || item.totalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.emptyStateDesc}>Loading orders...</Text>
        </View>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={80} color="#ccc" />
          <Text style={styles.emptyStateTitle}>Search your orders</Text>
          <Text style={styles.emptyStateDesc}>
            Enter shop name or product name to find your orders
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="file-search-outline" size={80} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No orders found</Text>
        <Text style={styles.emptyStateDesc}>
          Try searching with different keywords
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by shop or product name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Count */}
      {searchQuery.trim() && filteredOrders.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Found {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </Text>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  emptyListContent: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderShopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  shopAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  highlightedText: {
    backgroundColor: '#fff59d',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  moreItems: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#999',
  },
  orderFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  orderTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff4757',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
