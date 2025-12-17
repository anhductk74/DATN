import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { shipperService, ShipperResponseDto, ShipperUpdateDto } from '../services/ShipperService ';
import { storageService } from '../services/storage.service';

interface EditProfileScreenProps {
  onBack: () => void;
}

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const [shipper, setShipper] = useState<ShipperResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

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
          setFullName(response.data.fullName || '');
          setPhoneNumber(response.data.phoneNumber || '');
          setGender(response.data.gender || '');
          setDateOfBirth(response.data.dateOfBirth || '');
          setVehicleType(response.data.vehicleType || '');
          setLicensePlate(response.data.licensePlate || '');
          setVehicleBrand(response.data.vehicleBrand || '');
          setVehicleColor(response.data.vehicleColor || '');
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateOfBirth(formattedDate);
    }
  };

  const handleSave = async () => {
    if (!shipper) return;

    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setSaving(true);

      const updateData: ShipperUpdateDto = {};

      // Only include changed fields
      if (fullName !== shipper.fullName) updateData.fullName = fullName;
      if (phoneNumber !== shipper.phoneNumber) updateData.phoneNumber = phoneNumber;
      if (gender !== (shipper.gender || '')) updateData.gender = gender;
      if (dateOfBirth !== (shipper.dateOfBirth || '')) updateData.dateOfBirth = dateOfBirth;
      if (vehicleType !== (shipper.vehicleType || '')) updateData.vehicleType = vehicleType;
      if (licensePlate !== (shipper.licensePlate || '')) updateData.licensePlate = licensePlate;
      if (vehicleBrand !== (shipper.vehicleBrand || '')) updateData.vehicleBrand = vehicleBrand;
      if (vehicleColor !== (shipper.vehicleColor || '')) updateData.vehicleColor = vehicleColor;

      if (Object.keys(updateData).length === 0) {
        Alert.alert('Thông báo', 'Không có thay đổi nào');
        return;
      }

      // Use updateShipperWithImages (backend requires multipart/form-data)
      const response = await shipperService.updateShipper(
        shipper.id, 
        updateData,
        undefined // No images in basic profile edit
      );

      if (response.success) {
        Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
          { text: 'OK', onPress: () => onBack() }
        ]);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
          <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
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
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={22} color="#1976D2" />
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'MALE' && styles.genderButtonActive]}
                onPress={() => setGender('MALE')}
              >
                <Ionicons 
                  name="male" 
                  size={20} 
                  color={gender === 'MALE' ? '#1976D2' : '#666'} 
                />
                <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextActive]}>
                  Nam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'FEMALE' && styles.genderButtonActive]}
                onPress={() => setGender('FEMALE')}
              >
                <Ionicons 
                  name="female" 
                  size={20} 
                  color={gender === 'FEMALE' ? '#1976D2' : '#666'} 
                />
                <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextActive]}>
                  Nữ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'OTHER' && styles.genderButtonActive]}
                onPress={() => setGender('OTHER')}
              >
                <Ionicons 
                  name="transgender" 
                  size={20} 
                  color={gender === 'OTHER' ? '#1976D2' : '#666'} 
                />
                <Text style={[styles.genderText, gender === 'OTHER' && styles.genderTextActive]}>
                  Khác
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.datePickerText}>
                {dateOfBirth || 'Chọn ngày sinh'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>

        {/* Vehicle Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="motorcycle" size={22} color="#1976D2" />
            <Text style={styles.cardTitle}>Thông tin phương tiện</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Loại xe</Text>
            <View style={styles.vehicleTypeContainer}>
              <TouchableOpacity
                style={[styles.vehicleTypeButton, vehicleType === 'XE_MAY' && styles.vehicleTypeButtonActive]}
                onPress={() => setVehicleType('XE_MAY')}
              >
                <MaterialIcons 
                  name="two-wheeler" 
                  size={24} 
                  color={vehicleType === 'XE_MAY' ? '#1976D2' : '#666'} 
                />
                <Text style={[styles.vehicleTypeText, vehicleType === 'XE_MAY' && styles.vehicleTypeTextActive]}>
                  Xe máy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.vehicleTypeButton, vehicleType === 'XE_TAI' && styles.vehicleTypeButtonActive]}
                onPress={() => setVehicleType('XE_TAI')}
              >
                <MaterialIcons 
                  name="local-shipping" 
                  size={24} 
                  color={vehicleType === 'XE_TAI' ? '#1976D2' : '#666'} 
                />
                <Text style={[styles.vehicleTypeText, vehicleType === 'XE_TAI' && styles.vehicleTypeTextActive]}>
                  Xe tải
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Biển số xe</Text>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Nhập biển số xe"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hãng xe</Text>
            <TextInput
              style={styles.input}
              value={vehicleBrand}
              onChangeText={setVehicleBrand}
              placeholder="Nhập hãng xe (Honda, Yamaha, ...)"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Màu xe</Text>
            <TextInput
              style={styles.input}
              value={vehicleColor}
              onChangeText={setVehicleColor}
              placeholder="Nhập màu xe"
            />
          </View>
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
  required: {
    color: '#F44336',
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
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  genderButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  genderText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleTypeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  vehicleTypeButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  vehicleTypeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  vehicleTypeTextActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
  datePickerButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  datePickerText: {
    fontSize: 14,
    color: '#333',
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
