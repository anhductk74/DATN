import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { shipperSubOrderService, ShipperDashboardResponseDto } from '../services/ShipperSubOrderService';
import { storageService } from '../services/storage.service';
import { UserInfo } from '../types/auth.types';

const { width } = Dimensions.get('window');

type Props = {
  onNavigateToOrders: () => void;
  onNavigateToIncome: () => void;
  onNavigateToProfile: () => void;
};

export default function HomeAndroidScreen({ 
  onNavigateToOrders, 
  onNavigateToIncome,
  onNavigateToProfile 
}: Props) {
  const [isOnline, setIsOnline] = useState(false);
  const [dashboard, setDashboard] = useState<ShipperDashboardResponseDto | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadDashboard = async (shipperId: string) => {
    try {
      const response = await shipperSubOrderService.getDashboard(shipperId);
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const info = await storageService.getUserInfo();
      setUserInfo(info);
      
      if (info?.shipper?.shipperId) {
        await loadDashboard(info.shipper.shipperId);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const handleLogout = async () => {
    try {
      await storageService.clearAll();
      // Navigation will be handled by parent
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SmartMall Shipper</Text>
           
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={onNavigateToProfile}>
            {userInfo?.avatar ? (
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#1976D2" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity
          style={[styles.statusToggle, isOnline && styles.statusToggleOnline]}
          onPress={toggleOnlineStatus}
          activeOpacity={0.8}
        >
          <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
          <Ionicons 
            name={isOnline ? 'toggle' : 'toggle-outline'} 
            size={24} 
            color="#fff" 
            style={styles.statusIcon}
          />
        </TouchableOpacity> */}

        {/* Dashboard Stats in Header */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {dashboard?.today.delivered || 0}
            </Text>
            <Text style={styles.statLabel}>Đã giao</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="list" size={20} color="#0288D1" />
            </View>
            <Text style={[styles.statValue, { color: '#0288D1' }]}>
              {dashboard?.today.totalAssigned || 0}
            </Text>
            <Text style={styles.statLabel}>Tổng đơn</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="bicycle" size={20} color="#F57C00" />
            </View>
            <Text style={[styles.statValue, { color: '#F57C00' }]}>
              {dashboard?.today.inTransit || 0}
            </Text>
            <Text style={styles.statLabel}>Đang giao</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF9C4' }]}>
              <Ionicons name="time-outline" size={20} color="#F57F17" />
            </View>
            <Text style={[styles.statValue, { color: '#F57F17' }]}>
              {dashboard?.today.pending || 0}
            </Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent}>
        {/* COD Summary Card - Fixed 2x2 Grid for Android */}
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
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Khu vực:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {userInfo.shipper.operationalRegionFull}
              </Text>
            </View>
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
                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="person-outline" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Thông tin cá nhân</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="settings-outline" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Cài đặt</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="help-circle-outline" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Trợ giúp</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
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
    marginTop: 12,
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
  codItemEnhanced: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
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
  codLabelEnhanced: {
    fontSize: 10,
    color: '#9E9E9E',
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 40 : 60,
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
