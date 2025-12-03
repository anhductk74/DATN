import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderService, Order } from '../services/OrderService';
import { orderTrackingService, OrderTrackingLogResponse } from '../services/orderTrackingService';
import addressService, { Address } from '../services/addressService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudinaryUrl } from '../config/config';

type OrderDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

interface OrderDetailScreenProps {
  navigation: OrderDetailScreenNavigationProp;
  route: OrderDetailScreenRouteProp;
}

const STATUS_INFO: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Order Placed', color: '#ff9800', icon: 'document-text' },
  CONFIRMED: { label: 'Confirmed', color: '#2196f3', icon: 'checkmark-circle' },
  SHIPPING: { label: 'Out for Delivery', color: '#9c27b0', icon: 'car' },
  DELIVERED: { label: 'Delivered', color: '#4caf50', icon: 'checkmark-done-circle' },
  CANCELLED: { label: 'Cancelled', color: '#f44336', icon: 'close-circle' },
  RETURN_REQUESTED: { label: 'Return Requested', color: '#ff5722', icon: 'return-up-back' },
};

export default function OrderDetailScreen({ navigation, route }: OrderDetailScreenProps) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingLogs, setTrackingLogs] = useState<OrderTrackingLogResponse[]>([]);
  const [addressDetail, setAddressDetail] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrackingDetail, setShowTrackingDetail] = useState(false);

  useEffect(() => {
    loadOrderDetail();
    loadTrackingLogs();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
        
        // Load address detail - prioritize addressId over shippingAddress.id
        const addressIdToLoad = response.data.addressId || response.data.shippingAddress?.id;
        if (addressIdToLoad) {
          loadAddressDetail(addressIdToLoad);
        }
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAddressDetail = async (addressId: string) => {
    try {
      console.log('Loading address detail for ID:', addressId);
      const response = await addressService.getAddress(addressId);
      console.log('Address detail response:', response);
      if (response.success && response.data) {
        setAddressDetail(response.data);
        console.log('Address detail loaded:', response.data);
      } else {
        console.warn('Failed to load address detail:', response.message);
      }
    } catch (error) {
      console.error('Error loading address detail:', error);
    }
  };

  const loadTrackingLogs = async () => {
    try {
      const response = await orderTrackingService.getTrackingLogs(orderId);
      if (response.success && response.data) {
        setTrackingLogs(response.data);
      }
    } catch (error) {
      console.error('Error loading tracking logs:', error);
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'PENDING', label: 'Order Placed', icon: 'document-text' },
      { key: 'CONFIRMED', label: 'Confirmed', icon: 'checkmark-circle' },
      { key: 'SHIPPING', label: 'Shipping', icon: 'bicycle' },
      { key: 'DELIVERED', label: 'Delivered', icon: 'checkmark-done-circle' },
    ];

    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order?.status || 'PENDING');

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const handleCancelOrder = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.id;

      const executeCancel = async () => {
        try {
          const response = await orderService.cancelOrder(orderId, userId);
          if (response.success) {
            Alert.alert('Success', 'Order cancelled successfully');
            loadOrderDetail();
          } else {
            Alert.alert('Error', response.message || 'Failed to cancel order');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to cancel order');
        }
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order?',
            options: ['No', 'Yes, Cancel'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              executeCancel();
            }
          }
        );
      } else {
        Alert.alert(
          'Cancel Order',
          'Are you sure you want to cancel this order?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes, Cancel',
              style: 'destructive',
              onPress: executeCancel,
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get user information');
    }
  };

  const handleContact = () => {
    Alert.alert('Contact Shop', 'Chat feature coming soon!');
  };

  const handleViewTracking = () => {
    navigation.navigate('OrderTrackingDetail', {
      orderId: order?.id || orderId,
      orderStatus: order?.status || 'PENDING',
      trackingNumber: order?.trackingNumber,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_INFO[order.status] || STATUS_INFO.PENDING;
  const progressSteps = getProgressSteps();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Detail</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: `${statusInfo.color}15` }]}>
          <View style={styles.statusBannerContent}>
            <Ionicons name={statusInfo.icon as any} size={32} color={statusInfo.color} />
            <View style={styles.statusBannerText}>
              <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
              <Text style={styles.statusDesc}>
                {order.status === 'DELIVERED' 
                  ? `Delivered on ${new Date(order.createdAt).toLocaleDateString()}`
                  : order.status === 'CANCELLED'
                  ? 'Your order has been cancelled'
                  : `Expected delivery: ${new Date(order.estimatedDelivery || order.createdAt).toLocaleDateString()}`
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Information - Clickable Card */}
        {order.status !== 'CANCELLED' && order.status !== 'PENDING' && (
          <TouchableOpacity 
            style={styles.shippingInfoCard}
            onPress={handleViewTracking}
            activeOpacity={0.7}
          >
            <View style={styles.shippingInfoHeader}>
              <View style={styles.shippingInfoLeft}>
                <Ionicons name="cube-outline" size={20} color="#2563eb" />
                <View style={styles.shippingInfoText}>
                  <Text style={styles.shippingInfoTitle}>Thông tin vận chuyển</Text>
                  {trackingLogs.length > 0 ? (
                    <View style={styles.trackingInfo}>
                      <Text style={styles.carrierText}>
                        {trackingLogs[0].carrier}: {order.trackingNumber || 'N/A'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.trackingInfo}>
                      <Text style={styles.carrierText}>
                        {order.trackingNumber ? `Mã vận đơn: ${order.trackingNumber}` : 'Đang cập nhật'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
            {trackingLogs.length > 0 && (
              <View style={styles.deliveryStatusRow}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={styles.deliveryStatusText} numberOfLines={1}>
                  {trackingLogs[0].statusDescription}
                </Text>
              </View>
            )}
            {trackingLogs.length > 0 && trackingLogs[0].updatedAt && (
              <Text style={styles.deliveryTime}>
                {new Date(trackingLogs[0].updatedAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <Text style={styles.addressName}>
                {addressDetail?.recipient || order.shippingAddress?.fullName || 'No Name'}
              </Text>
              <Text style={styles.addressPhone}>
                {addressDetail?.phoneNumber || order.shippingAddress?.phoneNumber || 'No Phone'}
              </Text>
            </View>
            <Text style={styles.addressText}>
              {addressDetail?.street || order.shippingAddress?.addressLine || 'No Address Line'}
            </Text>
            <Text style={styles.addressText}>
              {addressDetail 
                ? [addressDetail.commune, addressDetail.district, addressDetail.city].filter(Boolean).join(', ') || 'No City/District Information'
                : order.shippingAddress?.ward || order.shippingAddress?.district || order.shippingAddress?.city
                  ? [
                      order.shippingAddress?.ward,
                      order.shippingAddress?.district,
                      order.shippingAddress?.city,
                    ].filter(Boolean).join(', ')
                  : 'No City/District Information'}
            </Text>
            {addressDetail?.addressType && (
              <View style={styles.addressTypeContainer}>
                <View style={[
                  styles.addressTypeBadge,
                  addressDetail.addressType === 'HOME' && styles.addressTypeBadgeHome,
                  addressDetail.addressType === 'WORK' && styles.addressTypeBadgeWork,
                ]}>
                  <Text style={styles.addressTypeText}>
                    {addressDetail.addressType === 'HOME' ? '🏠 Home' : 
                     addressDetail.addressType === 'WORK' ? '💼 Work' : 
                     '📍 Other'}
                  </Text>
                </View>
                {addressDetail.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Shop Info */}
        <View style={styles.section}>
          <View style={styles.shopHeader}>
            <View style={styles.shopInfo}>
              {order.shopAvatar ? (
                <Image
                  source={{ uri: order.shopAvatar.startsWith('http') ? order.shopAvatar : getCloudinaryUrl(order.shopAvatar) }}
                  style={styles.shopAvatar}
                />
              ) : (
                <View style={styles.shopAvatarPlaceholder}>
                  <MaterialCommunityIcons name="store" size={20} color="#2563eb" />
                </View>
              )}
              <Text style={styles.shopName}>{order.shopName || 'Shop'}</Text>
            </View>
            <TouchableOpacity style={styles.chatButton} onPress={handleContact}>
              <MaterialCommunityIcons name="message-text" size={18} color="#2563eb" />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Order Items */}
          <View style={styles.itemsList}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemImageContainer}>
                  {item.productImage ? (
                    <Image
                      source={{ uri: getCloudinaryUrl(item.productImage) }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.placeholderImage]}>
                      <Ionicons name="image-outline" size={32} color="#ccc" />
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  {item.variant?.attributes && item.variant.attributes.length > 0 && (
                    <Text style={styles.itemVariant}>
                      {item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                    </Text>
                  )}
                  <View style={styles.itemBottom}>
                    <Text style={styles.itemPrice}>
                      {item.price.toLocaleString('vi-VN')}đ
                    </Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({order.items.length} items)</Text>
              <Text style={styles.summaryValue}>
                {(order.totalAmount - (order.shippingFee || 0)).toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>
                {!order.shippingFee || order.shippingFee === 0 ? 'Free' : `${order.shippingFee.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
            {order.discountAmount && order.discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -{order.discountAmount.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                {(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>{order.paymentMethod || 'COD'}</Text>
            </View>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <View style={styles.orderIdContainer}>
                <Text style={styles.infoValue}>
                  #{order.id.substring(0, 8).toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Order ID', order.id, [
                      { text: 'Close', style: 'cancel' }
                    ]);
                  }}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Time</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>
            {order.trackingNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tracking Number</Text>
                <Text style={styles.infoValue}>{order.trackingNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Support Section */}
        {order.status === 'DELIVERED' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <View style={styles.supportContainer}>
              <TouchableOpacity 
                style={styles.supportButtonFull}
                onPress={() => navigation.navigate('OrderReturnRequest', { orderId: order.id })}
              >
                <Ionicons name="return-down-back" size={20} color="#f44336" />
                <Text style={styles.supportButtonFullText}>Return Request</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.supportButtonFull}
                onPress={handleContact}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2563eb" />
                <Text style={styles.supportButtonFullTextSecondary}>Contact Shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {order.status === 'PENDING' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.contactButton]}
              onPress={handleContact}
            >
              <Text style={styles.contactButtonText}>Contact Shop</Text>
            </TouchableOpacity>
          </>
        )}
        {(order.status === 'CONFIRMED' || order.status === 'SHIPPING' || order.status === 'CANCELLED') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.contactButton, styles.fullButton]}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>Contact Shop</Text>
          </TouchableOpacity>
        )}
        {order.status === 'DELIVERED' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.buyAgainButton]}
            >
              <Text style={styles.buyAgainButtonText}>Buy Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.contactButton]}
              onPress={() => navigation.navigate('Review', { orderId: order.id })}
            >
              <Text style={styles.contactButtonText}>Review</Text>
            </TouchableOpacity>
          </>
        )}
        {order.status === 'RETURN_REQUESTED' && (
          <View style={styles.returnRequestedBanner}>
            <Ionicons name="hourglass-outline" size={20} color="#ff9800" />
            <Text style={styles.returnRequestedText}>
              Your return request is being reviewed
            </Text>
          </View>
        )}
      </View>
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
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  returnRequestedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  returnRequestedText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statusBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 13,
    color: '#666',
  },
  shippingInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shippingInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shippingInfoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  shippingInfoText: {
    flex: 1,
    marginLeft: 8,
  },
  shippingInfoTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
  },
  trackingInfo: {
    marginTop: 2,
  },
  carrierText: {
    fontSize: 13,
    color: '#666',
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  deliveryStatusText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  shippingInfoStatus: {
    fontSize: 13,
    color: '#2563eb',
    marginBottom: 2,
  },
  shippingInfoTracking: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  shippingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shippingInfoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  previewText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  shippingSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  shippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shippingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shippingHeaderText: {
    marginLeft: 8,
    flex: 1,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  shippingStatus: {
    fontSize: 13,
    color: '#2563eb',
  },
  trackingDetailContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  trackingTimeline: {
    paddingLeft: 4,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  trackingStepLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  trackingDotActive: {
    backgroundColor: '#2563eb',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#e3f2fd',
  },
  trackingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    minHeight: 30,
  },
  trackingStepRight: {
    flex: 1,
    paddingBottom: 4,
  },
  trackingLocation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  trackingLocationActive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb',
  },
  trackingDesc: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  trackingTime: {
    fontSize: 12,
    color: '#999',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  progressSteps: {
    marginTop: 16,
  },
  progressStep: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressStepLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotCompleted: {
    backgroundColor: '#2563eb',
  },
  progressDotActive: {
    backgroundColor: '#2563eb',
    borderWidth: 3,
    borderColor: '#e3f2fd',
  },
  progressLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    minHeight: 40,
  },
  progressLineCompleted: {
    backgroundColor: '#2563eb',
  },
  progressStepRight: {
    flex: 1,
    paddingTop: 2,
  },
  progressStepLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  progressStepLabelCompleted: {
    color: '#333',
  },
  progressStepLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  progressStepDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressFullText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  addressTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  addressTypeBadgeHome: {
    backgroundColor: '#e3f2fd',
  },
  addressTypeBadgeWork: {
    backgroundColor: '#fff3e0',
  },
  addressTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#4caf50',
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  shopAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 6,
  },
  chatButtonText: {
    fontSize: 13,
    color: '#2563eb',
    marginLeft: 4,
    fontWeight: '600',
  },
  itemsList: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff4757',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountValue: {
    color: '#ff4757',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff4757',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  contactButton: {
    backgroundColor: '#2563eb',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buyAgainButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buyAgainButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  supportContainer: {
    gap: 10,
    marginBottom: 8,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 6,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  supportButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 6,
  },
  supportButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  supportButtonFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  supportButtonFullText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  supportButtonFullTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});
