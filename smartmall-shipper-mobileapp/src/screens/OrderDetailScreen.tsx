import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { shipperSubOrderService, SubShipmentOrderResponseDto, Address, ProofImageResponse } from '../services/ShipperSubOrderService';

interface OrderDetailScreenProps {
  order: SubShipmentOrderResponseDto;
  onBack?: () => void;
  onOrderUpdated?: () => void;
}

export default function OrderDetailScreen({ order, onBack, onOrderUpdated }: OrderDetailScreenProps) {
  const [orderData, setOrderData] = useState<SubShipmentOrderResponseDto>(order);
  const [loading, setLoading] = useState(false);
  const [proofImages, setProofImages] = useState<ProofImageResponse[]>([]);
  const [loadingProof, setLoadingProof] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [isOrderVerified, setIsOrderVerified] = useState(false); // Require QR verification for sequence 1
  const [permission, requestPermission] = useCameraPermissions();
  const [uploadingProof, setUploadingProof] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const hasScannedRef = useRef(false);

  // Sync orderData when order prop changes (important for QR scan flow)
  useEffect(() => {
    console.log('📦 Order prop updated:', {
      id: order.id,
      sequence: order.sequence,
      shopName: order.shopName,
      shopAddress: order.shopAddress,
      customerName: order.customerName,
      customerAddress: order.customerAddress
    });
    setOrderData(order);
    // Don't auto-verify - require QR scan for sequence 1
    // For other sequences, verification is not required
  }, [order]);

  useEffect(() => {
    if (orderData.sequence === 3) {
      loadProofImages();
    }
  }, [orderData.sequence]);

  const loadProofImages = async () => {
    try {
      setLoadingProof(true);
     
      const response = await shipperSubOrderService.getProofImages(orderData.shipmentOrderCode);
      
      if (response.success && response.data) {
        setProofImages(response.data);
      } else {
        console.log('No proof images found or error:', response.message);
      }
    } catch (error) {
      console.error('Error loading proof images:', error);
    } finally {
      setLoadingProof(false);
    }
  };

  const handleStatusAction = async (action: 'pickup' | 'transit' | 'deliver') => {
    console.log('🎬 [handleStatusAction] Starting action:', action);
    console.log('📦 [handleStatusAction] Order data:', {
      id: orderData.id,
      shipmentOrderCode: orderData.shipmentOrderCode,
      status: orderData.status,
      sequence: orderData.sequence
    });
    
    try {
      setLoading(true);
      let response;
      const actionText = action === 'pickup' ? 'lấy hàng' : action === 'transit' ? 'vận chuyển' : 'giao hàng';
      
      console.log(`🚀 [handleStatusAction] Calling API for: ${actionText}`);
      switch (action) {
        case 'pickup':
          response = await shipperSubOrderService.confirmPickup(orderData.shipmentOrderCode);
          break;
        case 'transit':
          response = await shipperSubOrderService.confirmTransit(orderData.shipmentOrderCode);
          break;
        case 'deliver':
          response = await shipperSubOrderService.confirmDelivery(orderData.shipmentOrderCode);
          break;
      }

      console.log('📨 [handleStatusAction] API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ [handleStatusAction] Success! New order data:', response.data);
        Alert.alert('Thành công', `Đã xác nhận ${actionText}`);
        setOrderData(response.data);
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      } else {
        console.log('❌ [handleStatusAction] Failed:', response.message);
        Alert.alert('Lỗi', response.message || `Không thể xác nhận ${actionText}`);
      }
    } catch (error: any) {
      console.error('❌ [handleStatusAction] Exception caught:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh để upload ảnh minh chứng'
        );
        return;
      }

      // Show options: Camera or Gallery
      Alert.alert(
        'Upload ảnh minh chứng',
        'Chọn nguồn ảnh:',
        [
          {
            text: 'Chụp ảnh',
            onPress: () => takePhoto(),
          },
          {
            text: 'Chọn từ thư viện',
            onPress: () => pickImage(),
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Lỗi', 'Không thể yêu cầu quyền truy cập');
    }
  };

  const takePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!cameraPermission.granted) {
        Alert.alert('Cần quyền camera', 'Vui lòng cấp quyền camera để chụp ảnh');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      setUploadingProof(true);

      // Create FormData
      const formData: any = new FormData();
      const filename = image.uri.split('/').pop() || 'proof.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: image.uri,
        name: filename,
        type: type,
      });

      // Call API
      const response = await shipperSubOrderService.uploadProof(
        orderData.shipmentOrderCode,
        formData
      );

      if (response.success) {
        Alert.alert('Thành công', 'Đã upload ảnh minh chứng');
        // Reload proof images
        await loadProofImages();
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể upload ảnh');
      }
    } catch (error: any) {
      console.error('Error uploading proof:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi upload ảnh');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleQRScan = async () => {
    if (!permission) {
      Alert.alert('Đang tải quyền', 'Vui lòng đợi...');
      return;
    }
    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Không có quyền truy cập camera',
          'Vui lòng cấp quyền camera trong cài đặt để quét QR code'
        );
        return;
      }
    }
    // Reset scan state when opening scanner
    hasScannedRef.current = false;
    setIsScanning(false);
    setShowQRScanner(true);
  };

  const handleBarCodeScanned = (result: any) => {
    // Prevent multiple scans using ref (works better on iOS)
    if (hasScannedRef.current || isScanning || !result.data) {
      return;
    }

    // Mark as scanned immediately
    hasScannedRef.current = true;
    setIsScanning(true);
    setShowQRScanner(false);
    
    // Small delay to ensure camera is closed before alert
    setTimeout(() => {
      verifyOrder(result.data);
    }, 300);
  };

  const verifyOrder = async (scannedCode: string) => {
    try {
      setLoading(true);
      
      // Call API to verify tracking code
      const verifyResponse = await shipperSubOrderService.getByTrackingCode(scannedCode);
      
      if (!verifyResponse.success || !verifyResponse.data) {
        Alert.alert(
          'Xác thực thất bại', 
          verifyResponse.message || 'Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại mã tracking code.'
        );
        return;
      }

      // Check if scanned order matches current order
      if (verifyResponse.data.id !== orderData.id) {
        Alert.alert(
          'Mã không khớp',
          `Mã QR bạn quét (${scannedCode}) thuộc đơn hàng khác.\n\nĐơn hiện tại: ${orderData.shipmentOrderCode}\nVui lòng quét đúng mã QR của đơn hàng này.`,
          [{ text: 'Thử lại', onPress: () => handleQRScan() }]
        );
        return;
      }

      // Verify successful
      setIsOrderVerified(true);
      setScannedCode(scannedCode);
      
      Alert.alert(
        'Xác thực thành công!', 
        `Đơn hàng ${scannedCode} đã được xác thực.\n\nBạn có thể tiến hành xác nhận lấy hàng.`,
        [{ text: 'Đồng ý' }]
      );
    } catch (error: any) {
      console.error('Error verifying order:', error);
      Alert.alert(
        'Lỗi xác thực', 
        error.message || 'Đã xảy ra lỗi khi xác thực đơn hàng. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
      setIsScanning(false);
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
      case 'PENDING': return 'Chờ lấy hàng';
      case 'PICKING_UP': return 'Đang lấy hàng';
      case 'IN_TRANSIT': return 'Đang vận chuyển';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'RETURNING': return 'Đang hoàn trả';
      case 'RETURNED': return 'Đã hoàn trả';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'clock-outline';
      case 'PICKING_UP': return 'cube-outline';
      case 'IN_TRANSIT': return 'car-outline';
      case 'DELIVERED': return 'checkmark-done-circle';
      default: return 'ellipse-outline';
    }
  };

  const formatAddress = (address?: Address): string => {
    if (!address) return 'N/A';
    const parts = [address.street, address.ward, address.district, address.city, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

  const getShortTrackingCode = (code: string | null | undefined): string => {
    if (!code) return 'N/A';
    const parts = code.split('-');
    return parts.length > 0 ? parts[parts.length - 1] : code;
  };

  const canPickup = orderData.status === 'PENDING';
  const canTransit = orderData.status === 'PICKING_UP';
  const canDeliver = orderData.status === 'IN_TRANSIT';
  const statusColor = getStatusColor(orderData.status);

  // For sequence 1, need QR verification before allowing pickup
  const showQRButton = orderData.sequence === 1 && canPickup && !isOrderVerified;
  const showPickupButton = orderData.sequence === 1 && canPickup && isOrderVerified;
  const showDeliveryButton = orderData.sequence === 1 && canTransit;

  const getTimelineSteps = () => {
    const steps = [
      { key: 'PENDING', label: 'Chờ lấy', icon: 'clock-outline' },
      { key: 'PICKING_UP', label: 'Đang lấy', icon: 'cube-outline' },
      { key: 'IN_TRANSIT', label: 'Vận chuyển', icon: 'car-outline' },
      { key: 'DELIVERED', label: 'Đã giao', icon: 'checkmark-done-circle' },
    ];

    const statusOrder = ['PENDING', 'PICKING_UP', 'IN_TRANSIT', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(orderData.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
          <Ionicons name={getStatusIcon(orderData.status) as any} size={40} color={statusColor} />
          <View style={styles.statusCardInfo}>
            <Text style={styles.statusLabel}>Trạng thái</Text>
            <Text style={[styles.statusValue, { color: statusColor }]}>
              {getStatusLabel(orderData.status)}
            </Text>
          </View>
          <View style={styles.trackingBadge}>
            <Ionicons name="qr-code-outline" size={16} color="#1976D2" />
            <Text style={styles.trackingCode}>...{getShortTrackingCode(orderData.shipmentOrderCode)}</Text>
          </View>
        </View>

        {/* Route Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THÔNG TIN LỘ TRÌNH</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.routeDot} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Điểm xuất phát</Text>
                <Text style={styles.routeValue}>
                  {orderData.sequence === 1 && orderData.shopName 
                    ? orderData.shopName 
                    : orderData.fromWarehouseName}
                </Text>
                {orderData.sequence === 1 && orderData.shopAddress && (
                  <Text style={styles.routeAddress}>{formatAddress(orderData.shopAddress)}</Text>
                )}
                {orderData.sequence === 1 && orderData.shopPhone && (
                  <View style={styles.routeContact}>
                    <Ionicons name="call" size={14} color="#666" />
                    <Text style={styles.routePhone}>{orderData.shopPhone}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotEnd]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Điểm đến</Text>
                <Text style={styles.routeValue}>
                  {orderData.sequence === 3 && orderData.customerName 
                    ? orderData.customerName 
                    : orderData.toWarehouseName}
                </Text>
                {orderData.sequence === 3 && orderData.customerAddress && (
                  <Text style={styles.routeAddress}>{formatAddress(orderData.customerAddress)}</Text>
                )}
                {orderData.sequence === 3 && orderData.customerPhone && (
                  <View style={styles.routeContact}>
                    <Ionicons name="call" size={14} color="#666" />
                    <Text style={styles.routePhone}>{orderData.customerPhone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THÔNG TIN ĐƠN HÀNG</Text>
          
          <View style={styles.infoGrid}>
            {orderData.codAmount !== undefined && orderData.codAmount > 0 && (
              <View style={styles.infoItem}>
                <FontAwesome5 name="money-bill-wave" size={20} color="#4CAF50" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Thu COD</Text>
                  <Text style={styles.infoValue}>{formatCurrency(orderData.codAmount)}</Text>
                </View>
              </View>
            )}
            
            {orderData.shippingFee !== undefined && (
              <View style={styles.infoItem}>
                <FontAwesome5 name="shipping-fast" size={20} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phí vận chuyển</Text>
                  <Text style={styles.infoValue}>{formatCurrency(orderData.shippingFee)}</Text>
                </View>
              </View>
            )}
            
            {orderData.weight !== undefined && (
              <View style={styles.infoItem}>
                <FontAwesome5 name="weight" size={20} color="#FF9800" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Khối lượng</Text>
                  <Text style={styles.infoValue}>{orderData.weight} kg</Text>
                </View>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="truck-delivery" size={20} color="#9C27B0" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Chặng vận chuyển</Text>
                <Text style={styles.infoValue}>Chặng {orderData.sequence}</Text>
              </View>
            </View>

            {orderData.updateTime && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#FF9800" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Cập nhật lần cuối</Text>
                  <Text style={styles.infoValue}>{formatDateTime(orderData.updateTime)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Timeline - Horizontal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TIẾN TRÌNH GIAO HÀNG</Text>
          
          <View style={styles.timelineContainerHorizontal}>
            {getTimelineSteps().map((step, index) => (
              <React.Fragment key={step.key}>
                <View style={styles.timelineStepContent}>
                  <View style={[
                    styles.timelineIcon,
                    step.completed && styles.timelineIconCompleted,
                    step.active && styles.timelineIconActive,
                  ]}>
                    <Ionicons 
                      name={step.icon as any} 
                      size={18} 
                      color={step.completed ? '#fff' : '#999'}
                    />
                  </View>
                  <Text 
                    numberOfLines={1}
                    style={[
                      styles.timelineLabelHorizontal,
                      step.active && styles.timelineLabelActive
                    ]}>
                    {step.label}
                  </Text>
                </View>
                {index < getTimelineSteps().length - 1 && (
                  <View style={[
                    styles.timelineLineHorizontal,
                    step.completed && styles.timelineLineCompleted
                  ]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Proof Images (for Sequence 3) */}
        {orderData.sequence === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ẢNH MINH CHỨNG GIAO HÀNG</Text>
            
            {loadingProof ? (
              <ActivityIndicator size="small" color="#1976D2" />
            ) : proofImages.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofGallery}>
                {proofImages.map((proof) => {
                  // Build full Cloudinary URL from path
                  const imageUrl = proof.url.startsWith('http') 
                    ? proof.url 
                    : `https://res.cloudinary.com${proof.url}`;
                  
                  console.log('Rendering image:', { id: proof.id, url: imageUrl });
                  
                  return (
                    <View key={proof.id} style={styles.proofImageContainer}>
                      <Image 
                        source={{ uri: imageUrl }}
                        style={styles.proofImage}
                        resizeMode="cover"
                        onLoadStart={() => console.log('Image loading started:', imageUrl)}
                        onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
                        onError={(error) => {
                          console.error('❌ Image load error:', imageUrl);
                          console.error('Error details:', error.nativeEvent);
                        }}
                      />
                      <Text style={styles.imageDebugText}>{proof.id.substring(0, 8)}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.noProofText}>Chưa có ảnh minh chứng</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Sequence 1: QR verification flow */}
          {showQRButton && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleQRScan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Quét mã QR để xác thực</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {showPickupButton && (
            <>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.verifiedText}>✓ Đơn hàng đã được xác thực</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSuccess]}
                onPress={() => handleStatusAction('pickup')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cube-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Xác nhận đã lấy hàng</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {showDeliveryButton && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => handleStatusAction('deliver')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Xác nhận đã đến kho</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Other sequences: Original flow */}
          {orderData.sequence !== 1 && canPickup && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleQRScan}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="qr-code-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Quét QR để lấy hàng</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => handleStatusAction('pickup')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#1976D2" />
                ) : (
                  <>
                    <Ionicons name="cube-outline" size={20} color="#1976D2" />
                    <Text style={styles.actionButtonTextSecondary}>Xác nhận thủ công</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {orderData.sequence !== 1 && canTransit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => handleStatusAction('transit')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="car-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Bắt đầu vận chuyển</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {orderData.sequence !== 1 && canDeliver && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSuccess]}
              onPress={() => handleStatusAction('deliver')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Hoàn thành giao hàng</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {orderData.sequence === 3 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleUploadProof}
              disabled={uploadingProof}
            >
              {uploadingProof ? (
                <ActivityIndicator color="#1976D2" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={20} color="#1976D2" />
                  <Text style={styles.actionButtonTextSecondary}>Upload ảnh minh chứng</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        onRequestClose={() => {
          setShowQRScanner(false);
          setIsScanning(false);
          hasScannedRef.current = false;
        }}
      >
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => {
              setShowQRScanner(false);
              setIsScanning(false);
              hasScannedRef.current = false;
            }} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Quét mã QR đơn hàng</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.scannerWrapper}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerInstruction}>
                Đưa mã QR vào khung hình để quét
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  scrollView: { flex: 1 },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusCardInfo: { flex: 1, marginLeft: 12 },
  statusLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  statusValue: { fontSize: 18, fontWeight: 'bold' },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trackingCode: { fontSize: 11, fontWeight: '600', color: '#1976D2', marginLeft: 4 },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  routeContainer: {},
  routePoint: { flexDirection: 'row', alignItems: 'flex-start' },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginRight: 12,
    marginTop: 4,
  },
  routeDotEnd: { backgroundColor: '#4CAF50' },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  routeValue: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 4 },
  routeAddress: { fontSize: 13, color: '#666', marginBottom: 6, lineHeight: 18 },
  routeContact: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  routePhone: { fontSize: 13, color: '#666', marginLeft: 6 },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginLeft: 5,
    marginVertical: 8,
  },
  infoGrid: { gap: 12 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 8,
  },
  infoTextContainer: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#212121' },
  timelineContainer: { paddingLeft: 8 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  timelineIconContainer: { alignItems: 'center' },
  timelineContainerHorizontal: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timelineStepContent: {
    alignItems: 'center',
    width: 60,
  },
  timelineLineHorizontal: {
    height: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginTop: 20,
  },
  timelineLabelHorizontal: { 
    fontSize: 10, 
    color: '#666', 
    marginTop: 6,
    textAlign: 'center',
    width: 60,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: { backgroundColor: '#4CAF50' },
  timelineIconActive: { backgroundColor: '#1976D2' },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  timelineLineCompleted: { backgroundColor: '#4CAF50' },
  timelineLabel: { fontSize: 14, color: '#666', marginLeft: 12, flex: 1 },
  timelineLabelActive: { fontWeight: '600', color: '#1976D2' },
  proofGallery: { marginTop: 8 },
  proofImageContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  proofImage: {
    width: 120,
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  imageDebugText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  noProofText: { fontSize: 14, color: '#999', textAlign: 'center', padding: 20 },
  actionSection: { padding: 16, paddingBottom: 32 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonPrimary: { backgroundColor: '#1976D2' },
  actionButtonSuccess: { backgroundColor: '#4CAF50' },
  actionButtonSecondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1976D2' },
  actionButtonText: { fontSize: 15, fontWeight: '600', color: '#fff', marginLeft: 8 },
  actionButtonTextSecondary: { fontSize: 15, fontWeight: '600', color: '#1976D2', marginLeft: 8 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scannerWrapper: {
    flex: 1,
    position: 'relative',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerInstruction: {
    marginTop: 24,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
