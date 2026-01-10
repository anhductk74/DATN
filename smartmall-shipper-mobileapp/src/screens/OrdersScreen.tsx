import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { shipperSubOrderService, SubShipmentOrderResponseDto } from '../services/ShipperSubOrderService';
import { storageService } from '../services/storage.service';

interface OrdersScreenProps {
  onBack?: () => void;
  onNavigateToDetail?: (order: SubShipmentOrderResponseDto) => void;
}

type MainTab = 'current' | 'history';
type CurrentSubTab = 1 | 2 | 3;

export default function OrdersScreen({ onBack, onNavigateToDetail }: OrdersScreenProps) {
  const [mainTab, setMainTab] = useState<MainTab>('current');
  const [currentSubTab, setCurrentSubTab] = useState<CurrentSubTab>(3);
  const [orders, setOrders] = useState<SubShipmentOrderResponseDto[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SubShipmentOrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [mainTab]);

  useEffect(() => {
    filterOrdersBySubTab();
  }, [orders, currentSubTab, mainTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userInfo = await storageService.getUserInfo();
      const shipperId = userInfo?.shipper?.shipperId;

      if (!shipperId) {
        console.error('No shipper ID found');
        return;
      }

      let response;
      if (mainTab === 'current') {
        response = await shipperSubOrderService.getSubOrders(shipperId);
      } else {
        response = await shipperSubOrderService.getHistory(shipperId);
      }

      if (response.success && response.data) {
        setOrders(response.data);
        
        // Log để kiểm tra trackingCode trong lịch sử
        if (mainTab === 'history') {
          console.log('===== HISTORY ORDERS =====');
          console.log('Total orders:', response.data.length);
          response.data.slice(0, 3).forEach((order: SubShipmentOrderResponseDto, index: number) => {
            console.log(`\nOrder ${index + 1}:`);
            console.log('  - id:', order.id);
            console.log('  - shipmentOrderCode:', order.shipmentOrderCode);
            console.log('  - trackingCode:', order.trackingCode);
            console.log('  - sequence:', order.sequence);
            console.log('  - status:', order.status);
          });
          console.log('==========================');
        }
      } else {
        console.error('Failed to load orders:', response.message);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersBySubTab = () => {
    if (mainTab === 'history') {
      setFilteredOrders(orders);
      return;
    }
    // In current tab, only show orders that need action (exclude completed/delivered orders)
    const activeStatuses = ['PENDING', 'PICKING_UP', 'IN_TRANSIT', 'RETURNING'];
    const filtered = orders.filter(order => 
      order.sequence === currentSubTab && activeStatuses.includes(order.status)
    );
    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [mainTab]);

  const handleOrderPress = (order: SubShipmentOrderResponseDto) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(order);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'PICKING_UP': return '#2196F3';
      case 'IN_TRANSIT': return '#9C27B0';
      case 'DELIVERED': return '#4CAF50';
      case 'RETURNING': return '#F44336';
      case 'RETURNED': return '#9E9E9E';
      case 'CANCELLED': return '#757575';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ lấy';
      case 'PICKING_UP': return 'Đang lấy';
      case 'IN_TRANSIT': return 'Vận chuyển';
      case 'DELIVERED': return 'Đã giao';
      case 'RETURNING': return 'Đang hoàn';
      case 'RETURNED': return 'Đã hoàn';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'PICKING_UP': return 'cube-outline';
      case 'IN_TRANSIT': return 'car-outline';
      case 'DELIVERED': return 'checkmark-done-circle';
      case 'RETURNING': return 'return-up-back';
      case 'RETURNED': return 'return-down-back';
      case 'CANCELLED': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const getSequenceColor = (sequence: number) => {
    switch (sequence) {
      case 1: return '#FF9800';
      case 2: return '#2196F3';
      case 3: return '#4CAF50';
      default: return '#999';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatAddress = (address?: any): string => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    const parts = [address.street, address.ward, address.district, address.city].filter(Boolean);
    return parts.join(', ');
  };

  const getShortTrackingCode = (code: string | null | undefined): string => {
    if (!code) return 'N/A';
    const parts = code.split('-');
    return parts.length > 0 ? parts[parts.length - 1] : code;
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return 'N/A';
    }
  };

  const renderOrderItem = ({ item }: { item: SubShipmentOrderResponseDto }) => {
    const statusColor = getStatusColor(item.status);
    const sequenceColor = getSequenceColor(item.sequence);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.trackingRow}>
            <Ionicons name="qr-code-outline" size={20} color="#1976D2" />
            <Text style={styles.trackingCode}>...{getShortTrackingCode(item.trackingCode || item.shipmentOrderCode)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={styles.routeDot} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Từ</Text>
              {item.sequence === 1 ? (
                // Tab Lấy hàng: Từ Shop
                <>
                  <Text style={styles.routeValue} numberOfLines={1}>{item.shopName || 'Shop'}</Text>
                  {item.shopAddress && (
                    <Text style={styles.routeAddress} numberOfLines={1}>
                      {formatAddress(item.shopAddress)}
                    </Text>
                  )}
                </>
              ) : (
                // Tab Vận chuyển & Giao hàng: Từ Kho
                <>
                  <Text style={styles.routeValue} numberOfLines={1}>{item.fromWarehouseName}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Đến</Text>
              {item.sequence === 3 ? (
                // Tab Giao hàng: Đến Khách hàng
                <>
                  <Text style={styles.routeValue} numberOfLines={1}>{item.customerName || 'Khách hàng'}</Text>
                  {item.customerAddress && (
                    <Text style={styles.routeAddress} numberOfLines={1}>
                      {formatAddress(item.customerAddress)}
                    </Text>
                  )}
                </>
              ) : (
                // Tab Lấy hàng & Vận chuyển: Đến Kho
                <>
                  <Text style={styles.routeValue} numberOfLines={1}>{item.toWarehouseName}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Contact Info */}
        {((item.sequence === 1 && (item.shopName || item.shopPhone)) || 
          ((item.sequence === 2 || item.sequence === 3) && (item.customerName || item.customerPhone))) && (
          <View style={styles.contactSection}>
            {item.sequence === 1 ? (
              <>
                {item.shopName && (
                  <View style={styles.contactItem}>
                    <Ionicons name="business" size={14} color="#FF9800" />
                    <Text style={styles.contactText} numberOfLines={1}>{item.shopName}</Text>
                  </View>
                )}
                {item.shopPhone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={14} color="#FF9800" />
                    <Text style={styles.contactText} numberOfLines={1}>{item.shopPhone}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {item.customerName && (
                  <View style={styles.contactItem}>
                    <Ionicons name="person" size={14} color="#4CAF50" />
                    <Text style={styles.contactText} numberOfLines={1}>{item.customerName}</Text>
                  </View>
                )}
                {item.customerPhone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={14} color="#4CAF50" />
                    <Text style={styles.contactText} numberOfLines={1}>{item.customerPhone}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          {item.codAmount !== undefined && item.codAmount > 0 && (
            <View style={styles.infoBox}>
              <FontAwesome5 name="money-bill-wave" size={12} color="#4CAF50" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>COD</Text>
                <Text style={styles.infoValue}>{formatCurrency(item.codAmount)}</Text>
              </View>
            </View>
          )}
          {item.shippingFee !== undefined && (
            <View style={styles.infoBox}>
              <FontAwesome5 name="shipping-fast" size={12} color="#2196F3" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phí</Text>
                <Text style={styles.infoValue}>{formatCurrency(item.shippingFee)}</Text>
              </View>
            </View>
          )}
          {item.weight !== undefined && (
            <View style={styles.infoBox}>
              <FontAwesome5 name="weight" size={12} color="#FF9800" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Khối lượng</Text>
                <Text style={styles.infoValue}>{item.weight} kg</Text>
              </View>
            </View>
          )}
        </View>

        {item.updateTime && (
          <View style={styles.updateTimeSection}>
            <Ionicons name="time-outline" size={12} color="#999" />
            <Text style={styles.updateTimeText}>Cập nhật: {formatDateTime(item.updateTime)}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={[styles.sequenceBadge, { backgroundColor: sequenceColor + '20' }]}>
            <Text style={[styles.sequenceText, { color: sequenceColor }]}>
              Chặng {item.sequence}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => handleOrderPress(item)}
          >
            <Text style={styles.detailButtonText}>Xử lí</Text>
            <Ionicons name="chevron-forward" size={16} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainTabContainer}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'current' && styles.mainTabActive]}
          onPress={() => setMainTab('current')}
        >
          <Ionicons name="cube" size={20} color={mainTab === 'current' ? '#1976D2' : '#999'} />
          <Text style={[styles.mainTabText, mainTab === 'current' && styles.mainTabTextActive]}>
            Hiện tại
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'history' && styles.mainTabActive]}
          onPress={() => setMainTab('history')}
        >
          <Ionicons name="time" size={20} color={mainTab === 'history' ? '#1976D2' : '#999'} />
          <Text style={[styles.mainTabText, mainTab === 'history' && styles.mainTabTextActive]}>
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      {mainTab === 'current' && (
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTab, currentSubTab === 3 && styles.subTabActive]}
            onPress={() => setCurrentSubTab(3)}
          >
            <View style={[styles.subTabDot, currentSubTab === 3 && { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.subTabText, currentSubTab === 3 && styles.subTabTextActive]}>Giao hàng</Text>
            <Text style={styles.subTabSubtext}>Kho → KH</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, currentSubTab === 2 && styles.subTabActive]}
            onPress={() => setCurrentSubTab(2)}
          >
            <View style={[styles.subTabDot, currentSubTab === 2 && { backgroundColor: '#2196F3' }]} />
            <Text style={[styles.subTabText, currentSubTab === 2 && styles.subTabTextActive]}>Vận chuyển</Text>
            <Text style={styles.subTabSubtext}>Kho → Kho</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, currentSubTab === 1 && styles.subTabActive]}
            onPress={() => setCurrentSubTab(1)}
          >
            <View style={[styles.subTabDot, currentSubTab === 1 && { backgroundColor: '#FF9800' }]} />
            <Text style={[styles.subTabText, currentSubTab === 1 && styles.subTabTextActive]}>Lấy hàng</Text>
            <Text style={styles.subTabSubtext}>Shop → Kho</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976D2']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>Không có đơn hàng</Text>
              <Text style={styles.emptySubtext}>
                {mainTab === 'current'
                  ? `Chưa có đơn hàng ở chặng ${currentSubTab}`
                  : 'Chưa có lịch sử giao hàng'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  mainTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  mainTabActive: { borderBottomColor: '#1976D2' },
  mainTabText: { fontSize: 15, color: '#999', marginLeft: 6, fontWeight: '500' },
  mainTabTextActive: { color: '#1976D2', fontWeight: '700' },
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  subTabActive: { backgroundColor: '#E3F2FD' },
  subTabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#BDBDBD', marginBottom: 4 },
  subTabText: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 2 },
  subTabTextActive: { color: '#1976D2' },
  subTabSubtext: { fontSize: 10, color: '#999' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  listContent: { padding: 16 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  trackingRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackingCode: { fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginLeft: 6 },
  sequenceBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  sequenceText: { fontSize: 11, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  routeSection: { backgroundColor: '#FAFAFA', borderRadius: 8, padding: 10, marginBottom: 12 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', marginRight: 8 },
  routeDotEnd: { backgroundColor: '#4CAF50' },
  routeContent: { flex: 1 },
  routeLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  routeValue: { fontSize: 13, fontWeight: '600', color: '#212121' },
  routeAddress: { fontSize: 11, color: '#666', marginTop: 2 },
  routeLine: { width: 1, height: 8, backgroundColor: '#E0E0E0', marginLeft: 4, marginVertical: 4 },
  contactSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  contactText: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },
  infoSection: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  infoTextContainer: { marginLeft: 6 },
  infoLabel: { fontSize: 9, color: '#999' },
  infoValue: { fontSize: 11, fontWeight: '600', color: '#212121' },
  updateTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  updateTimeText: { fontSize: 11, color: '#999', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 },
  detailButtonText: { fontSize: 13, fontWeight: '600', color: '#1976D2', marginRight: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#BDBDBD', marginTop: 8, textAlign: 'center' },
});
