import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HomeAndroidScreen from '../screens/HomeAndroidScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import IncomeScreen from '../screens/IncomeScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import VerificationDocumentsScreen from '../screens/VerificationDocumentsScreen';
import { storageService } from '../services/storage.service';
import { SubShipmentOrderResponseDto } from '../services/ShipperSubOrderService';
import { ShipperTransactionResponseDto } from '../services/ShipperTransactionService';

type Screen = 'home' | 'orders' | 'orderDetail' | 'income' | 'transactionDetail' | 'profile' | 'editProfile' | 'verificationDocuments';

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedOrder, setSelectedOrder] = useState<SubShipmentOrderResponseDto | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<ShipperTransactionResponseDto | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Auth state changed
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const token = await storageService.getAccessToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('home');
  };

  const navigateToOrders = () => {
    setCurrentScreen('orders');
  };

  const navigateToIncome = () => {
    setCurrentScreen('income');
  };

  const navigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const navigateToEditProfile = () => {
    setCurrentScreen('editProfile');
  };

  const navigateToVerificationDocuments = () => {
    setCurrentScreen('verificationDocuments');
  };

  const navigateBackToProfile = () => {
    setCurrentScreen('profile');
  };

  const navigateBackToHome = () => {
    setCurrentScreen('home');
  };

  const navigateToTransactionDetail = (transaction: ShipperTransactionResponseDto) => {
    setSelectedTransaction(transaction);
    setCurrentScreen('transactionDetail');
  };

  const navigateBackToIncome = () => {
    setCurrentScreen('income');
    setSelectedTransaction(null);
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
    setSelectedOrder(null);
    setSelectedTransaction(null);
  };

  const handleQRScan = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền camera để quét mã QR');
        return;
      }
    }
    
    if (permission && !permission.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền camera để quét mã QR');
        return;
      }
    }

    setScanned(false);
    setShowQRScanner(true);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setShowQRScanner(false);

    try {
      const { shipperSubOrderService } = await import('../services/ShipperSubOrderService');
      
      // Approach: Always fetch full order list to get complete shop/customer info
      // because getByTrackingCode may not include these details for sequence 1 & 3
      const userInfo = await storageService.getUserInfo();
      const shipperId = userInfo?.shipper?.shipperId;
      
      if (!shipperId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin shipper');
        return;
      }
      
      // Fetch full order list with complete details
      const ordersResponse = await shipperSubOrderService.getSubOrders(shipperId);
      
      if (ordersResponse.success && ordersResponse.data) {
        // Find ALL matching orders (same tracking number, different sequences)
        // QR code might be just the number part (e.g., "1942713266")
        // but tracking code is full format (e.g., "S23017939.SGP02-N10.1942713266")
        const matchingOrders = ordersResponse.data.filter(o => 
          o.shipmentOrderCode === data || o.shipmentOrderCode.endsWith(data)
        );
        
        // Priority: sequence 1 → 2 → 3, but skip DELIVERED orders
        // Filter out completed orders (DELIVERED, RETURNED, CANCELLED)
        const completedStatuses = ['DELIVERED', 'RETURNED', 'CANCELLED'];
        const activeOrders = matchingOrders.filter(o => !completedStatuses.includes(o.status));
        
        // Sort by sequence to get the lowest sequence first
        activeOrders.sort((a, b) => a.sequence - b.sequence);
        
        const fullOrder = activeOrders[0]; // Get first active (lowest sequence)
        
        if (fullOrder) {
          setSelectedOrder(fullOrder);
          setCurrentScreen('orderDetail');
        } else if (matchingOrders.length > 0) {
          // All sub-orders are completed
          Alert.alert('Thông báo', 'Tất cả các chặng của đơn hàng này đã hoàn thành');
        } else {
          // Fallback: try getByTrackingCode if not found in current list
          const response = await shipperSubOrderService.getByTrackingCode(data);
          if (response.success && response.data) {
            setSelectedOrder(response.data);
            setCurrentScreen('orderDetail');
          } else {
            Alert.alert('Không tìm thấy', 'Không tìm thấy đơn hàng với mã: ' + data);
          }
        }
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tìm kiếm đơn hàng');
    }
  };

  const navigateToOrderDetail = (order: SubShipmentOrderResponseDto) => {
    setSelectedOrder(order);
    setCurrentScreen('orderDetail');
  };

  const navigateBackToOrders = () => {
    setCurrentScreen('orders');
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renderBottomNav = () => (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={navigateToHome}>
          <Ionicons name="home" size={24} color={currentScreen === 'home' ? '#1976D2' : '#999'} />
          <Text style={currentScreen === 'home' ? styles.navTextActive : styles.navText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={navigateToOrders}>
          <Ionicons name="list-outline" size={24} color={currentScreen === 'orders' || currentScreen === 'orderDetail' ? '#1976D2' : '#999'} />
          <Text style={currentScreen === 'orders' || currentScreen === 'orderDetail' ? styles.navTextActive : styles.navText}>Đơn hàng</Text>
        </TouchableOpacity>
        
        {/* Center QR Button Placeholder */}
        <View style={styles.navItem} />
        
        <TouchableOpacity style={styles.navItem} onPress={navigateToIncome}>
          <Ionicons name="wallet-outline" size={24} color={currentScreen === 'income' || currentScreen === 'transactionDetail' ? '#1976D2' : '#999'} />
          <Text style={currentScreen === 'income' || currentScreen === 'transactionDetail' ? styles.navTextActive : styles.navText}>Thu nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
          <Ionicons name="person-outline" size={24} color={currentScreen === 'profile' || currentScreen === 'editProfile' || currentScreen === 'verificationDocuments' ? '#1976D2' : '#999'} />
          <Text style={currentScreen === 'profile' || currentScreen === 'editProfile' || currentScreen === 'verificationDocuments' ? styles.navTextActive : styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
      
      {/* Floating QR Button */}
      <TouchableOpacity style={styles.qrButton} onPress={handleQRScan}>
        <Ionicons name="qr-code" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  let screenContent;
  
  switch (currentScreen) {
    case 'orderDetail':
      screenContent = selectedOrder ? (
        <OrderDetailScreen 
          order={selectedOrder} 
          onBack={navigateBackToOrders}
          onOrderUpdated={() => {}}
        />
      ) : (
        <OrdersScreen onBack={navigateToHome} onNavigateToDetail={navigateToOrderDetail} />
      );
      break;
    case 'orders':
      screenContent = <OrdersScreen onBack={navigateToHome} onNavigateToDetail={navigateToOrderDetail} />;
      break;
    case 'transactionDetail':
      screenContent = selectedTransaction ? (
        <TransactionDetailScreen
          transaction={selectedTransaction}
          onBack={navigateBackToIncome}
        />
      ) : (
        <IncomeScreen onBack={navigateToHome} onNavigateToDetail={navigateToTransactionDetail} />
      );
      break;
    case 'income':
      screenContent = <IncomeScreen onBack={navigateToHome} onNavigateToDetail={navigateToTransactionDetail} />;
      break;
    case 'profile':
      screenContent = <ProfileScreen onBack={navigateToHome} onNavigateToEditProfile={navigateToEditProfile} onNavigateToVerification={navigateToVerificationDocuments} />;
      break;
    case 'editProfile':
      screenContent = <EditProfileScreen onBack={navigateBackToProfile} />;
      break;
    case 'verificationDocuments':
      screenContent = <VerificationDocumentsScreen onBack={navigateBackToProfile} />;
      break;
    case 'home':
    default:
      // Use Android-specific HomeScreen on Android platform
      if (Platform.OS === 'android') {
        screenContent = <HomeAndroidScreen onNavigateToOrders={navigateToOrders} onNavigateToIncome={navigateToIncome} onNavigateToProfile={navigateToProfile} />;
      } else {
        screenContent = <HomeScreen onLogout={handleLogout} onNavigateToOrders={navigateToOrders} onNavigateToIncome={navigateToIncome} onNavigateToProfile={navigateToProfile} />;
      }
      break;
  }

  return (
    <View style={styles.container}>
      {screenContent}
      {renderBottomNav()}
      
      {/* QR Scanner Modal */}
      <Modal visible={showQRScanner} animationType="slide" onRequestClose={() => setShowQRScanner(false)}>
        <View style={styles.qrScannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.qrOverlay}>
              <Text style={styles.qrText}>Quét mã QR trên đơn hàng</Text>
              <View style={styles.qrFrame} />
            </View>
          </CameraView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowQRScanner(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bottomNavContainer: {
    position: 'relative',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'android' ? 8 : 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
    marginTop: 4,
  },
  qrButton: {
    position: 'absolute',
    top: -16,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  qrScannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#1976D2',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
});
