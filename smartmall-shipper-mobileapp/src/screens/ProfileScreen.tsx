import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { shipperService, ShipperResponseDto } from '../services/ShipperService ';
import { storageService } from '../services/storage.service';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToEditProfile?: () => void;
  onNavigateToVerification?: () => void;
}

export default function ProfileScreen({ onBack, onNavigateToEditProfile, onNavigateToVerification }: ProfileScreenProps) {
  const [shipper, setShipper] = useState<ShipperResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShipperInfo();
  }, []);

  const loadShipperInfo = async () => {
    try {
      const userInfo = await storageService.getUserInfo();
      if (userInfo?.shipper?.shipperId) {
        const shipperId = userInfo.shipper.shipperId;
      
        const response = await shipperService.getById(shipperId);
       
        
        if (response.success && response.data) {
          setShipper(response.data);
        } else {
          console.log('Failed to load shipper:', response.message);
          Alert.alert('Lỗi', response.message || 'Không thể tải thông tin');
        }
      } else {
        console.log('No shipperId found in userInfo');
        Alert.alert('Lỗi', 'Không tìm thấy ID shipper');
      }
    } catch (error) {
      console.error('Error loading shipper info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShipperInfo();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'INACTIVE':
        return '#F44336';
      case 'BUSY':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'BUSY':
        return 'Bận';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shipper) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Không tìm thấy thông tin</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Avatar & Name Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {shipper.avatar ? (
              <Image source={{ uri: shipper.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color="#1976D2" />
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipper.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusLabel(shipper.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.fullName}>{shipper.fullName}</Text>
          <Text style={styles.phoneNumber}>{shipper.phoneNumber}</Text>
          
          {shipper.shippingCompanyName && (
            <View style={styles.companyTag}>
              <FontAwesome5 name="building" size={12} color="#1976D2" />
              <Text style={styles.companyTagText}>{shipper.shippingCompanyName}</Text>
            </View>
          )}
        </View>

        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={22} color="#1976D2" />
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="male-female" size={18} color="#666" />
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{shipper.gender || 'Chưa cập nhật'}</Text>
          </View>

          {shipper.dateOfBirth && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color="#666" />
              <Text style={styles.infoLabel}>Ngày sinh:</Text>
              <Text style={styles.infoValue}>
                {new Date(shipper.dateOfBirth).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}

          {shipper.address && (
            <View style={styles.infoRow}>
              <Ionicons name="home" size={18} color="#666" />
              <Text style={styles.infoLabel}>Địa chỉ:</Text>
              <Text style={styles.infoValue}>{shipper.address}</Text>
            </View>
          )}

          {shipper.username && (
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={18} color="#666" />
              <Text style={styles.infoLabel}>Tài khoản:</Text>
              <Text style={styles.infoValue}>{shipper.username}</Text>
            </View>
          )}
        </View>

        {/* Vehicle Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="motorcycle" size={20} color="#1976D2" />
            <Text style={styles.cardTitle}>Thông tin phương tiện</Text>
          </View>

          {shipper.vehicleType && (
            <View style={styles.infoRow}>
              <MaterialIcons name="motorcycle" size={18} color="#666" />
              <Text style={styles.infoLabel}>Loại xe:</Text>
              <Text style={styles.infoValue}>{shipper.vehicleType}</Text>
            </View>
          )}

          {shipper.licensePlate && (
            <View style={styles.infoRow}>
              <MaterialIcons name="confirmation-number" size={18} color="#666" />
              <Text style={styles.infoLabel}>Biển số:</Text>
              <Text style={styles.infoValueHighlight}>{shipper.licensePlate}</Text>
            </View>
          )}

          {shipper.vehicleBrand && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="tag" size={16} color="#666" />
              <Text style={styles.infoLabel}>Hãng xe:</Text>
              <Text style={styles.infoValue}>{shipper.vehicleBrand}</Text>
            </View>
          )}

          {shipper.vehicleColor && (
            <View style={styles.infoRow}>
              <Ionicons name="color-palette" size={18} color="#666" />
              <Text style={styles.infoLabel}>Màu xe:</Text>
              <Text style={styles.infoValue}>{shipper.vehicleColor}</Text>
            </View>
          )}
        </View>

        {/* Operational Area Card */}
        {shipper.operationalRegionFull && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={22} color="#1976D2" />
              <Text style={styles.cardTitle}>Khu vực hoạt động</Text>
            </View>

            <View style={styles.areaContainer}>
              <Ionicons name="map" size={18} color="#F57C00" />
              <Text style={styles.areaText}>{shipper.operationalRegionFull}</Text>
            </View>

            {shipper.maxDeliveryRadius && (
              <View style={styles.radiusContainer}>
                <Ionicons name="radio-button-on" size={16} color="#1976D2" />
                <Text style={styles.radiusText}>
                  Bán kính giao hàng: {shipper.maxDeliveryRadius} km
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Verification Documents Card */}
        <TouchableOpacity style={styles.card} onPress={onNavigateToVerification}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="id-card" size={20} color="#1976D2" />
            <Text style={styles.cardTitle}>Giấy tờ xác minh</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginLeft: 'auto' }} />
          </View>

          <View style={styles.verificationInfo}>
            {shipper.idCardNumber && (
              <View style={styles.infoRow}>
                <FontAwesome5 name="address-card" size={16} color="#666" />
                <Text style={styles.infoLabel}>CMND/CCCD:</Text>
                <Text style={styles.infoValue}>{shipper.idCardNumber}</Text>
              </View>
            )}

            {shipper.driverLicenseNumber && (
              <View style={styles.infoRow}>
                <FontAwesome5 name="id-badge" size={16} color="#666" />
                <Text style={styles.infoLabel}>GPLX:</Text>
                <Text style={styles.infoValue}>{shipper.driverLicenseNumber}</Text>
              </View>
            )}

            {!shipper.idCardNumber && !shipper.driverLicenseNumber && (
              <Text style={styles.emptyVerificationText}>Nhấn để cập nhật giấy tờ xác minh</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={onNavigateToEditProfile}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E3F2FD',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#1976D2',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  companyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  companyTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  infoValueHighlight: {
    flex: 1,
    fontSize: 15,
    color: '#1976D2',
    fontWeight: '700',
    textAlign: 'right',
  },
  areaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  areaText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingLeft: 4,
    gap: 8,
  },
  radiusText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  verificationInfo: {
    marginTop: 4,
  },
  emptyVerificationText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  documentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  documentItem: {
    width: '48%',
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  documentLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
