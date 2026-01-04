import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { storageService } from '../services/storage.service';
import { UserInfo } from '../types/auth.types';
import { shipperSubOrderService, ShipperDashboardResponseDto } from '../services/ShipperSubOrderService';
import { websocketService, DeliveryMessage } from '../services/websocket.service';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onLogout?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToIncome?: () => void;
  onNavigateToProfile?: () => void;
}

export default function HomeScreen({ onLogout, onNavigateToOrders, onNavigateToIncome, onNavigateToProfile }: HomeScreenProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dashboard, setDashboard] = useState<ShipperDashboardResponseDto | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width * 0.75));

  useEffect(() => {
    loadUserInfo();
    
    // Kết nối WebSocket
    websocketService.connect()
      .catch((error) => {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối WebSocket. Vui lòng thử lại.');
      });

    // Đăng ký listener cho WebSocket
    const removeListener = websocketService.addListener(handleWebSocketMessage);

    // Cleanup khi unmount
    return () => {
      removeListener();
      websocketService.disconnect();
    };
  }, []);

  const loadUserInfo = async () => {
    const info = await storageService.getUserInfo();
    setUserInfo(info);
    
    if (info?.shipper?.shipperId) {
      await loadDashboard(info.shipper.shipperId);
    }
  };

  const loadDashboard = async (shipperId: string) => {
    try {
      const response = await shipperSubOrderService.getDashboard(shipperId);
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleWebSocketMessage = (message: DeliveryMessage) => {
    // Reload dashboard khi có message mới
    if (userInfo?.shipper?.shipperId) {
      loadDashboard(userInfo.shipper.shipperId);
    }

    // Hiển thị thông báo cho user
    if (message.type === 'ASSIGNED') {
      Alert.alert(
        '🚚 Đơn hàng mới',
        message.message || 'Bạn có đơn hàng mới được giao',
        [
          {
            text: 'Xem ngay',
            onPress: () => onNavigateToOrders?.(),
          },
          {
            text: 'Đóng',
            style: 'cancel',
          },
        ]
      );
    } else if (message.type === 'STATUS_UPDATE') {
      Alert.alert(
        '📦 Cập nhật trạng thái',
        message.message || 'Đơn hàng đã được cập nhật',
        [{ text: 'OK' }]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserInfo();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await storageService.clearAll();
    closeMenu();
    onLogout?.();
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const shipper = userInfo?.shipper;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={openMenu} style={styles.menuBtn}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SmartMall Shipper</Text>
            <Text style={styles.headerSubtitle}>Giao hàng thông minh</Text>
          </View>
          
          <View style={styles.avatarContainer}>
            {userInfo?.avatar ? (
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#1976D2" />
              </View>
            )}
          </View>
        </View>

      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976D2']} />
        }
      >
        {/* Stats Cards - Today Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="briefcase-outline" size={24} color="#1976D2" />
            </View>
            <Text style={styles.statValue}>{dashboard?.today.totalAssigned || 0}</Text>
            <Text style={styles.statLabel}>Đơn được giao</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#388E3C" />
            </View>
            <Text style={[styles.statValue, { color: '#388E3C' }]}>
              {dashboard?.today.delivered || 0}
            </Text>
            <Text style={styles.statLabel}>Đã giao</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="bicycle" size={24} color="#F57C00" />
            </View>
            <Text style={[styles.statValue, { color: '#F57C00' }]}>
              {dashboard?.today.inTransit || 0}
            </Text>
            <Text style={styles.statLabel}>Đang giao</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF9C4' }]}>
              <Ionicons name="time-outline" size={24} color="#F57F17" />
            </View>
            <Text style={[styles.statValue, { color: '#F57F17' }]}>
              {dashboard?.today.pending || 0}
            </Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
        </View>

        {/* COD Summary Card */}
        {dashboard?.cod && (
          <TouchableOpacity style={styles.codCard} onPress={onNavigateToIncome} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="money-bill-wave" size={20} color="#1976D2" />
              <Text style={styles.cardTitle}>Tiền thu hộ & Thu nhập</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginLeft: 'auto' }} />
            </View>
            <View style={styles.codGrid}>
              <View style={styles.codItemEnhanced}>
                <View style={[styles.codIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="cash" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.codLabelEnhanced}>Đã thu</Text>
                <Text style={[styles.codValueEnhanced, { color: '#4CAF50' }]}>
                  {dashboard.cod.totalCollected.toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.codCurrency}>VNĐ</Text>
              </View>
              <View style={styles.codItemEnhanced}>
                <View style={[styles.codIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <FontAwesome5 name="hand-holding-usd" size={18} color="#1976D2" />
                </View>
                <Text style={styles.codLabelEnhanced}>Đã nộp</Text>
                <Text style={[styles.codValueEnhanced, { color: '#1976D2' }]}>
                  {dashboard.cod.totalPaid.toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.codCurrency}>VNĐ</Text>
              </View>
              <View style={styles.codItemEnhanced}>
                <View style={[styles.codIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <FontAwesome5 name="wallet" size={18} color="#FF9800" />
                </View>
                <Text style={styles.codLabelEnhanced}>Còn lại</Text>
                <Text style={[styles.codValueEnhanced, { color: '#FF9800' }]}>
                  {dashboard.cod.codBalance.toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.codCurrency}>VNĐ</Text>
              </View>
              <View style={styles.codItemEnhanced}>
                <View style={[styles.codIconContainer, { backgroundColor: '#F3E5F5' }]}>
                  <FontAwesome5 name="coins" size={18} color="#9C27B0" />
                </View>
                <Text style={styles.codLabelEnhanced}>Thu nhập</Text>
                <Text style={[styles.codValueEnhanced, { color: '#9C27B0' }]}>
                  {dashboard.cod.netIncome.toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.codCurrency}>VNĐ</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Show COD even if null for debugging */}
        {!dashboard?.cod && dashboard && (
          <View style={styles.codCard}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="money-bill-wave" size={20} color="#999" />
              <Text style={[styles.cardTitle, { color: '#999' }]}>Tiền thu hộ & Thu nhập</Text>
            </View>
            <Text style={{ textAlign: 'center', color: '#999', padding: 16 }}>
              Chưa có dữ liệu
            </Text>
          </View>
        )}

        {/* Recent Deliveries */}
        {dashboard?.recentDeliveries && dashboard.recentDeliveries.length > 0 && (
          <View style={styles.recentCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-done-circle" size={24} color="#1976D2" />
              <Text style={styles.cardTitle}>Đơn đã giao gần đây</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dashboard.recentDeliveries.length}</Text>
              </View>
            </View>
            {dashboard.recentDeliveries.map((delivery, index) => (
              <View key={index} style={styles.deliveryItemCard}>
                {/* Header Row */}
                <View style={styles.itemHeader}>
                  <View style={styles.trackingRow}>
                    <Ionicons name="cube" size={16} color="#1976D2" />
                    <Text style={styles.trackingText}>{delivery.trackingCode}</Text>
                  </View>
                  {/* <View style={styles.sequenceTag}>
                    <Text style={styles.sequenceTagText}>{delivery.sequence}</Text>
                  </View> */}
                </View>

                {/* Time */}
                <Text style={styles.timeText}>
                  <Ionicons name="time-outline" size={12} color="#4CAF50" />
                  {' '}{new Date(delivery.deliveredAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                {/* Recipient - One Line */}
                <View style={styles.recipientLine}>
                  <Ionicons name="person" size={14} color="#666" />
                  <Text style={styles.recipientText}>{delivery.recipientName}</Text>
                  <Text style={styles.phoneSeparator}>•</Text>
                  <Text style={styles.phoneText}>{delivery.recipientPhone}</Text>
                </View>

                {/* Address - One Line */}
                <View style={styles.addressLine}>
                  <Ionicons name="location" size={14} color="#F57C00" />
                  <Text style={styles.addressLineText} numberOfLines={1}>
                    {delivery.deliveryAddress}
                  </Text>
                </View>

                {/* Footer - One Line */}
                <View style={styles.itemFooter}>
                  <Ionicons name="business-outline" size={12} color="#999" />
                  <Text style={styles.footerText} numberOfLines={1}>{delivery.warehouseName}</Text>
                  <Text style={styles.footerSeparator}>•</Text>
                  <FontAwesome5 name="motorcycle" size={10} color="#999" />
                  <Text style={styles.footerText}>{delivery.vehicleInfo}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Show recent deliveries placeholder for debugging */}
        {(!dashboard?.recentDeliveries || dashboard.recentDeliveries.length === 0) && dashboard && (
          <View style={styles.recentCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color="#999" />
              <Text style={[styles.cardTitle, { color: '#999' }]}>Giao hàng gần đây</Text>
            </View>
            <View style={styles.emptyDeliveryState}>
              <Ionicons name="cube-outline" size={60} color="#E0E0E0" />
              <Text style={styles.emptyDeliveryText}>Chưa có đơn hàng đã giao</Text>
              <Text style={styles.emptyDeliverySubtext}>
                Các đơn hàng đã giao sẽ hiển thị tại đây
              </Text>
            </View>
          </View>
        )}

        {/* Shipper Info Card */}
        {userInfo?.shipper && (
          <View style={styles.shipperInfoCard}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="motorcycle" size={20} color="#1976D2" />
              <Text style={styles.cardTitle}>Thông tin phương tiện</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="motorcycle" size={18} color="#666" />
              <Text style={styles.infoLabel}>Loại xe:</Text>
              <Text style={styles.infoValue}>{userInfo.shipper.vehicleType}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="confirmation-number" size={18} color="#666" />
              <Text style={styles.infoLabel}>Biển số:</Text>
              <Text style={styles.infoValue}>{userInfo.shipper.licensePlate}</Text>
            </View>
            {userInfo.shipper.operationalRegionFull && (
              <View style={styles.areaSection}>
                <View style={styles.areaSectionHeader}>
                  <Ionicons name="location" size={18} color="#F57C00" />
                  <Text style={styles.areaSectionLabel}>Khu vực hoạt động</Text>
                </View>
                <View style={styles.areaBox}>
                  <Ionicons name="map" size={16} color="#F57C00" />
                  <Text style={styles.areaBoxText}>{userInfo.shipper.operationalRegionFull}</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Bottom padding to prevent content being hidden by bottom nav */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Side Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeMenu}
        >
          <Animated.View 
            style={[
              styles.sideMenu,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatarContainer}>
                  {userInfo?.avatar ? (
                    <Image source={{ uri: userInfo.avatar }} style={styles.menuAvatar} />
                  ) : (
                    <View style={styles.menuAvatarPlaceholder}>
                      <Ionicons name="person" size={40} color="#1976D2" />
                    </View>
                  )}
                </View>
                <Text style={styles.menuUserName}>{userInfo?.fullName}</Text>
                <Text style={styles.menuUserPhone}>{userInfo?.phoneNumber}</Text>
              </View>

              {/* Menu Items */}
              <View style={styles.menuContent}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    closeMenu();
                    onNavigateToProfile?.();
                  }}
                >
                  <Ionicons name="person-outline" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Thông tin cá nhân</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItemHelp}
                  onPress={() => {
                    const { Linking } = require('react-native');
                    Linking.openURL('tel:19006868');
                  }}
                >
                  <Ionicons name="call-outline" size={24} color="#4CAF50" />
                  <View style={styles.helpTextContainer}>
                    <Text style={styles.menuItemHelpText}>Gọi trợ giúp</Text>
                    <Text style={styles.helpPhoneText}>1900 6868</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.menuDivider} />
                
                <TouchableOpacity style={styles.menuItemLogout} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color="#F44336" />
                  <Text style={styles.menuItemLogoutText}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E3F2FD',
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggle: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  statusToggleOnline: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginRight: 10,
  },
  statusDotOnline: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  statusIcon: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  codCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  codItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: '1%',
    marginBottom: 8,
  },
  codItemEnhanced: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginHorizontal: '1%',
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#E8E8E8',
  },
  codIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  codLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  codLabelEnhanced: {
    fontSize: 10,
    color: '#9E9E9E',
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  codValueEnhanced: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  codCurrency: {
    fontSize: 9,
    color: '#BDBDBD',
    marginTop: 2,
    fontWeight: '500',
  },
  recentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deliveryItemCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 4,
  },
  sequenceTag: {
    backgroundColor: '#1976D2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sequenceTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeText: {
    fontSize: 11,
    color: '#4CAF50',
    marginBottom: 6,
    fontWeight: '500',
  },
  recipientLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 4,
  },
  phoneSeparator: {
    fontSize: 12,
    color: '#DDD',
    marginHorizontal: 6,
  },
  phoneText: {
    fontSize: 12,
    color: '#666',
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLineText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  footerText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
    flex: 1,
  },
  footerSeparator: {
    fontSize: 10,
    color: '#DDD',
    marginHorizontal: 6,
  },
  deliveryCard: {
    marginTop: 12,
    paddingBottom: 12,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackingCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 6,
  },
  sequenceBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sequenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  deliveryTimeText: {
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '600',
    marginLeft: 6,
  },
  recipientSection: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
  },
  recipientPhone: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  warehouseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
    marginRight: 8,
  },
  warehouseText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    marginLeft: 6,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  vehicleText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
  },
  emptyDeliveryState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyDeliveryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptyDeliverySubtext: {
    fontSize: 13,
    color: '#BDBDBD',
    marginTop: 4,
    textAlign: 'center',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
  },
  userInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shipperInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  areaSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  areaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  areaSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57C00',
  },
  areaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  areaBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  // Side Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  menuHeader: {
    backgroundColor: '#1976D2',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  menuAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#E3F2FD',
  },
  menuAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  menuAvatarPlaceholder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  menuUserPhone: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  menuContent: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
  menuItemHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#F1F8F4',
  },
  menuItemHelpText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  helpTextContainer: {
    marginLeft: 16,
  },
  helpPhoneText: {
    fontSize: 12,
    color: '#66BB6A',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  menuItemLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFEBEE',
  },
  menuItemLogoutText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 16,
    fontWeight: '600',
  },
});
