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
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { shipperService, ShipperResponseDto, ShipperUpdateDto } from '../services/ShipperService ';
import { storageService } from '../services/storage.service';

interface VerificationDocumentsScreenProps {
  onBack: () => void;
}

export default function VerificationDocumentsScreen({ onBack }: VerificationDocumentsScreenProps) {
  const [shipper, setShipper] = useState<ShipperResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [idCardNumber, setIdCardNumber] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  
  // Image states
  const [idCardFrontUri, setIdCardFrontUri] = useState<string | null>(null);
  const [idCardBackUri, setIdCardBackUri] = useState<string | null>(null);
  const [driverLicenseUri, setDriverLicenseUri] = useState<string | null>(null);

  // Helper function to get full Cloudinary URL
  const getCloudinaryUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    
    // Nếu đã là full URL thì return luôn
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Nếu là path từ Cloudinary (ví dụ: /dadr6xuhc/image/upload/v1765380181/...)
    // Thêm domain Cloudinary
    return `https://res.cloudinary.com${path}`;
  };

  useEffect(() => {
    loadShipperInfo();
  }, []);

  const loadShipperInfo = async () => {
    try {
      const userInfo = await storageService.getUserInfo();
      if (userInfo?.shipper?.shipperId) {
        const response = await shipperService.getById(userInfo.shipper.shipperId);
        
        if (response.success && response.data) {
          setShipper(response.data);
          setIdCardNumber(response.data.idCardNumber || '');
          setDriverLicenseNumber(response.data.driverLicenseNumber || '');
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tải thông tin');
        }
      }
    } catch (error) {
      console.error('Error loading shipper info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh để tiếp tục');
      return false;
    }
    return true;
  };

  const pickImage = async (type: 'idCardFront' | 'idCardBack' | 'driverLicense') => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === 'driverLicense' ? [4, 3] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        switch (type) {
          case 'idCardFront':
            setIdCardFrontUri(uri);
            break;
          case 'idCardBack':
            setIdCardBackUri(uri);
            break;
          case 'driverLicense':
            setDriverLicenseUri(uri);
            break;
        }
        
        Alert.alert('Thành công', 'Đã chọn ảnh. Nhấn "Lưu thay đổi" để upload ảnh lên server.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh');
    }
  };

  const handleSave = async () => {
    if (!shipper) return;

    try {
      setSaving(true);

      const updateData: ShipperUpdateDto = {};

      // Only include changed fields
      if (idCardNumber !== (shipper.idCardNumber || '')) {
        updateData.idCardNumber = idCardNumber;
      }
      if (driverLicenseNumber !== (shipper.driverLicenseNumber || '')) {
        updateData.driverLicenseNumber = driverLicenseNumber;
      }

      // Check if there are images to upload
      const hasImages = idCardFrontUri || idCardBackUri || driverLicenseUri;

      if (Object.keys(updateData).length === 0 && !hasImages) {
        Alert.alert('Thông báo', 'Không có thay đổi nào');
        return;
      }

      // Prepare images object
      const images: any = {};
      if (idCardFrontUri) images.idCardFront = idCardFrontUri;
      if (idCardBackUri) images.idCardBack = idCardBackUri;
      if (driverLicenseUri) images.driverLicense = driverLicenseUri;

      // Always use updateShipperWithImages (backend requires multipart/form-data)
      const response = await shipperService.updateShipper(
        shipper.id, 
        updateData, 
        Object.keys(images).length > 0 ? images : undefined
      );

      if (response.success) {
        // Reload data to show updated images
        await loadShipperInfo();
        // Clear local URIs after successful upload
        setIdCardFrontUri(null);
        setIdCardBackUri(null);
        setDriverLicenseUri(null);
        
        Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
          { text: 'OK', onPress: () => onBack() }
        ]);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating verification documents:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giấy tờ xác minh</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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
        <Text style={styles.headerTitle}>Giấy tờ xác minh</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* ID Card Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="address-card" size={20} color="#1976D2" />
            <Text style={styles.cardTitle}>CMND/CCCD</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số CMND/CCCD</Text>
            <TextInput
              style={styles.input}
              value={idCardNumber}
              onChangeText={setIdCardNumber}
              placeholder="Nhập số CMND/CCCD"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.documentsContainer}>
            {(idCardFrontUri || shipper?.idCardFrontImage) ? (
              <View style={styles.documentItem}>
                <Image 
                  source={{ uri: (idCardFrontUri || getCloudinaryUrl(shipper?.idCardFrontImage)) as string }} 
                  style={styles.documentImage} 
                  resizeMode="cover"
                />
                <Text style={styles.documentLabel}>CMND mặt trước</Text>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={() => pickImage('idCardFront')}
                >
                  <Ionicons name="camera" size={16} color="#1976D2" />
                  <Text style={styles.changeImageText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadBox}
                onPress={() => pickImage('idCardFront')}
              >
                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                <Text style={styles.uploadText}>Tải lên mặt trước</Text>
              </TouchableOpacity>
            )}

            {(idCardBackUri || shipper?.idCardBackImage) ? (
              <View style={styles.documentItem}>
                <Image 
                  source={{ uri: (idCardBackUri || getCloudinaryUrl(shipper?.idCardBackImage)) as string }} 
                  style={styles.documentImage} 
                  resizeMode="cover"
                />
                <Text style={styles.documentLabel}>CMND mặt sau</Text>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={() => pickImage('idCardBack')}
                >
                  <Ionicons name="camera" size={16} color="#1976D2" />
                  <Text style={styles.changeImageText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadBox}
                onPress={() => pickImage('idCardBack')}
              >
                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                <Text style={styles.uploadText}>Tải lên mặt sau</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Driver License Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="id-badge" size={20} color="#1976D2" />
            <Text style={styles.cardTitle}>Giấy phép lái xe</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số GPLX</Text>
            <TextInput
              style={styles.input}
              value={driverLicenseNumber}
              onChangeText={setDriverLicenseNumber}
              placeholder="Nhập số giấy phép lái xe"
            />
          </View>

          <View style={styles.documentsContainer}>
            {(driverLicenseUri || shipper?.driverLicenseImage) ? (
              <View style={styles.documentItemFull}>
                <Image 
                  source={{ uri: (driverLicenseUri || getCloudinaryUrl(shipper?.driverLicenseImage)) as string }} 
                  style={styles.documentImageFull} 
                  resizeMode="cover"
                />
                <Text style={styles.documentLabel}>Giấy phép lái xe</Text>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={() => pickImage('driverLicense')}
                >
                  <Ionicons name="camera" size={16} color="#1976D2" />
                  <Text style={styles.changeImageText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadBoxFull}
                onPress={() => pickImage('driverLicense')}
              >
                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                <Text style={styles.uploadText}>Tải lên ảnh GPLX</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color="#FF9800" />
          <Text style={styles.noteText}>
            Lưu ý: Ảnh giấy tờ cần rõ ràng, không bị mờ hay che khuất. 
            Chọn ảnh từ thư viện, sau đó nhấn "Lưu thay đổi" để upload tất cả lên server cùng lúc.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </>
          )}
        </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  documentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentItem: {
    width: '48%',
    alignItems: 'center',
  },
  documentItemFull: {
    width: '100%',
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  documentImageFull: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  documentLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  changeImageText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  uploadBox: {
    width: '48%',
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  uploadBoxFull: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  uploadText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
