import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderService, Order } from '../services/OrderService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudinaryUrl } from '../config/config';
import { orderReturnRequestService, OrderReturnResponseDto } from '../services/OrderReturnRequestService';

type OrdersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Orders'>;
type OrdersScreenRouteProp = RouteProp<RootStackParamList, 'Orders'>;

interface OrdersScreenProps {
  navigation: OrdersScreenNavigationProp;
  route: OrdersScreenRouteProp;
}

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';

const TABS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'PENDING', label: 'Pending', icon: 'time' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'SHIPPING', label: 'Shipping', icon: 'car' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'cube' },
  { key: 'CANCELLED', label: 'Cancelled', icon: 'close-circle' },
  { key: 'RETURN_REQUESTED', label: 'Return', icon: 'return-up-back' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#ff9800',
  CONFIRMED: '#2196f3',
  SHIPPING: '#9c27b0',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336',
  RETURN_REQUESTED: '#ff5722',
};

const defaultShopAvatar = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=32&h=32&fit=crop&crop=center";

export default function OrdersScreen({ navigation, route }: OrdersScreenProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus>('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<OrderReturnResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  }, [activeTab, orders, returnRequests]);

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
        setOrders(response.data.content);
      }

      // Load return requests
      const returnResponse = await orderReturnRequestService.getReturnRequestsByUser(userId);
      if (returnResponse.success && returnResponse.data) {
        setReturnRequests(returnResponse.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  }, [userId]);

  const filterOrders = () => {
    if (activeTab === 'RETURN_REQUESTED') {
      // Lọc các order có return request
      const orderIdsWithReturn = returnRequests.map(req => req.orderId);
      setFilteredOrders(orders.filter(order => orderIdsWithReturn.includes(order.id)));
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeTab));
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await orderService.cancelOrder(orderId, userId);
              if (response.success) {
                Alert.alert('Success', 'Order cancelled successfully');
                // Reload orders after successful cancellation
                await loadOrders();
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel order');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
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

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TABS}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === item.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(item.key)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={activeTab === item.key ? '#2563eb' : '#999'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === item.key && styles.activeTabText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    const firstItem = item.items[0];
    const remainingItems = item.items.length - 1;
    
    // Tìm return request cho order này (nếu có)
    const returnRequest = returnRequests.find(req => req.orderId === item.id);

    const handleBuyAgain = () => {
      // Navigate to product detail screen with the first product
      if (firstItem && firstItem.productId) {
        navigation.navigate('ProductDetail', { productId: firstItem.productId });
      } else {
        Alert.alert('Error', 'Product information not available');
      }
    };

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
            <Text style={styles.shopName}>{item.shopName || 'Shop'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[activeTab === 'RETURN_REQUESTED' ? 'RETURN_REQUESTED' : item.status]}15` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[activeTab === 'RETURN_REQUESTED' ? 'RETURN_REQUESTED' : item.status] }]}>
              {activeTab === 'RETURN_REQUESTED' && returnRequest ? returnRequest.status : getStatusLabel(item.status)}
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
                {firstItem.productName}
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

          <View style={styles.orderActions}>
            {item.status === 'PENDING' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonDanger]}
                  onPress={() => handleCancelOrder(item.id)}
                >
                  <Text style={styles.actionButtonDangerText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Contact</Text>
                </TouchableOpacity>
              </>
            )}
            {(item.status === 'CONFIRMED' || item.status === 'SHIPPING' || item.status === 'CANCELLED') && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Contact</Text>
              </TouchableOpacity>
            )}
            {item.status === 'DELIVERED' && activeTab !== 'RETURN_REQUESTED' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonOutline]}
                  onPress={handleBuyAgain}
                >
                  <Text style={styles.actionButtonOutlineText}>Buy Again</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Review', { orderId: item.id })}
                >
                  <Text style={styles.actionButtonText}>Review</Text>
                </TouchableOpacity>
              </>
            )}
            {activeTab === 'RETURN_REQUESTED' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonOutline]}
                  onPress={handleBuyAgain}
                >
                  <Text style={styles.actionButtonOutlineText}>Buy Again</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Review', { orderId: item.id })}
                >
                  <Text style={styles.actionButtonText}>Review</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="package-variant" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No orders found</Text>
      <Text style={styles.emptyStateDesc}>
        No {getStatusLabel(activeTab).toLowerCase()} orders
      </Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopNowButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('OrderSearch')}
        >
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {renderTabBar()}

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  searchButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
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
    marginBottom: 12,
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
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  actionButtonOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  actionButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  actionButtonDangerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f44336',
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
  shopNowButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  shopNowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
