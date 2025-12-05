import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import addressService, { Address, AddressType } from '../services/addressService';
import { locationService, Province, District, Ward } from '../services/locationService';

interface AddEditAddressScreenProps {
  navigation: any;
  route: {
    params?: {
      address?: Address;
    };
  };
}

export default function AddEditAddressScreen({ navigation, route }: AddEditAddressScreenProps) {
  const editingAddress = route.params?.address;
  const isEditing = !!editingAddress;

  // Form fields
  const [formData, setFormData] = useState({
    recipient: editingAddress?.recipient || '',
    phoneNumber: editingAddress?.phoneNumber || '',
    street: editingAddress?.street || '',
    commune: editingAddress?.commune || '',
    district: editingAddress?.district || '',
    city: editingAddress?.city || '',
    isDefault: editingAddress?.isDefault || false,
  });

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Selected codes
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | string>('');

  // Selection modals
  const [showProvinceSelector, setShowProvinceSelector] = useState(false);
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  const [showWardSelector, setShowWardSelector] = useState(false);

  // Loading states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setIsLoadingProvinces(true);
      console.log('🔄 Fetching provinces...');
      const data = await locationService.getProvinces();
      console.log('✅ Provinces loaded:', data.length);
      setProvinces(data);
    } catch (error) {
      console.error('❌ Error fetching provinces:', error);
      Alert.alert('Error', 'Failed to load provinces');
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: number | string) => {
    try {
      setIsLoadingDistricts(true);
      console.log('🔄 Fetching districts for province:', provinceCode);
      const data = await locationService.getDistricts(provinceCode);
      console.log('✅ Districts loaded:', data.length);
      setDistricts(data);
    } catch (error) {
      console.error('❌ Error fetching districts:', error);
      Alert.alert('Error', 'Failed to load districts');
      setDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtCode: number | string) => {
    try {
      setIsLoadingWards(true);
      console.log('🔄 Fetching wards for district:', districtCode);
      const data = await locationService.getWards(districtCode);
      console.log('✅ Wards loaded:', data.length);
      setWards(data);
    } catch (error) {
      console.error('❌ Error fetching wards:', error);
      Alert.alert('Error', 'Failed to load wards');
      setWards([]);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleSelectProvince = async (province: Province) => {
    console.log('✅ Province selected:', province.name, 'code:', province.code);
    const provinceCode = province.code || province.codename || '';
    setFormData(prev => ({
      ...prev,
      city: province.name,
      district: '',
      commune: '',
    }));
    setSelectedProvinceCode(provinceCode);
    setDistricts([]);
    setWards([]);
    setShowProvinceSelector(false);
    
    if (provinceCode) {
      await fetchDistricts(provinceCode);
    }
  };

  const handleSelectDistrict = async (district: District) => {
    console.log('✅ District selected:', district.name, 'code:', district.code);
    const districtCode = district.code || district.codename || '';
    setFormData(prev => ({
      ...prev,
      district: district.name,
      commune: '',
    }));
    setSelectedDistrictCode(districtCode);
    setWards([]);
    setShowDistrictSelector(false);
    
    if (districtCode) {
      await fetchWards(districtCode);
    }
  };

  const handleSelectWard = (ward: Ward) => {
    console.log('✅ Ward selected:', ward.name);
    setFormData(prev => ({
      ...prev,
      commune: ward.name,
    }));
    setShowWardSelector(false);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.recipient.trim()) {
      Alert.alert('Error', 'Please enter recipient name');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please select province/city');
      return;
    }
    if (!formData.district.trim()) {
      Alert.alert('Error', 'Please select district');
      return;
    }
    if (!formData.commune.trim()) {
      Alert.alert('Error', 'Please select ward/commune');
      return;
    }
    if (!formData.street.trim()) {
      Alert.alert('Error', 'Please enter street address');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving address...', formData);

      const addressData = {
        recipient: formData.recipient,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        commune: formData.commune,
        district: formData.district,
        city: formData.city,
        isDefault: formData.isDefault,
        addressType: 'HOME' as AddressType,
      };

      let response;
      if (isEditing && editingAddress) {
        response = await addressService.updateAddress(editingAddress.id, addressData);
      } else {
        response = await addressService.createAddress(addressData);
      }

      if (response.success) {
        Alert.alert(
          'Success',
          isEditing ? 'Address updated successfully' : 'Address added successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('❌ Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const renderLocationSelector = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: any[],
    onSelect: (item: any) => void,
    isLoading: boolean
  ) => {
    console.log(`📋 Rendering ${title}:`, {
      visible,
      itemsCount: items.length,
      isLoading,
      firstItem: items[0]?.name
    });
    
    if (!visible) return null;
    
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          ) : (
            <ScrollView style={styles.selectorList}>
              {items.map((item, index) => {
                if (index === 0) {
                  console.log('🎯 Rendering first item:', item.name);
                }
                return (
                  <TouchableOpacity
                    key={item.code || item.codename || index}
                    style={styles.selectorItem}
                    onPress={() => {
                      console.log('✅ Item selected:', item.name);
                      onSelect(item);
                    }}
                  >
                    <Text style={styles.selectorItemText}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Address' : 'Add Address'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipient Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.recipient}
            onChangeText={(text) => setFormData(prev => ({ ...prev, recipient: text }))}
            placeholder="Enter recipient name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
            placeholder="Enter phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* Province/City Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Province / City *</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              console.log('🗺️ Opening province selector');
              console.log('📊 Provinces available:', provinces.length);
              console.log('🔄 Is loading:', isLoadingProvinces);
              if (provinces.length === 0 && !isLoadingProvinces) {
                console.log('⚠️ No provinces, refetching...');
                fetchProvinces();
              }
              setShowProvinceSelector(true);
            }}
          >
            <Text style={formData.city ? styles.selectorTextFilled : styles.selectorTextEmpty}>
              {formData.city || 'Select province/city'}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* District Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>District *</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.city && styles.selectorDisabled]}
            onPress={() => {
              if (!formData.city) {
                Alert.alert('Notice', 'Please select province first');
                return;
              }
              console.log('🏙️ Opening district selector');
              setShowDistrictSelector(true);
            }}
          >
            <Text style={formData.district ? styles.selectorTextFilled : styles.selectorTextEmpty}>
              {formData.district || 'Select district'}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Ward/Commune Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ward / Commune *</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.district && styles.selectorDisabled]}
            onPress={() => {
              if (!formData.district) {
                Alert.alert('Notice', 'Please select district first');
                return;
              }
              console.log('🏘️ Opening ward selector');
              setShowWardSelector(true);
            }}
          >
            <Text style={formData.commune ? styles.selectorTextFilled : styles.selectorTextEmpty}>
              {formData.commune || 'Select ward/commune'}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Street Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.street}
            onChangeText={(text) => setFormData(prev => ({ ...prev, street: text }))}
            placeholder="House number, street name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Default Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
        >
          <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
            {formData.isDefault && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Set as default address</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Address'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Province Selector Modal */}
      {renderLocationSelector(
        showProvinceSelector,
        () => setShowProvinceSelector(false),
        'Select Province / City',
        provinces,
        handleSelectProvince,
        isLoadingProvinces
      )}

      {/* District Selector Modal */}
      {renderLocationSelector(
        showDistrictSelector,
        () => setShowDistrictSelector(false),
        'Select District',
        districts,
        handleSelectDistrict,
        isLoadingDistricts
      )}

      {/* Ward Selector Modal */}
      {renderLocationSelector(
        showWardSelector,
        () => setShowWardSelector(false),
        'Select Ward / Commune',
        wards,
        handleSelectWard,
        isLoadingWards
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorTextFilled: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  selectorTextEmpty: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  selectorArrow: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectorModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    paddingBottom: 20,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  selectorList: {
    flexGrow: 1,
  },
  selectorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectorItemText: {
    fontSize: 15,
    color: '#333',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
