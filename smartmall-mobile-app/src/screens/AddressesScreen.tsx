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
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import addressService, { Address, AddressType } from '../services/addressService';
import { locationService, Province, District, Ward } from '../services/locationService';

interface AddressesScreenProps {
  navigation: any;
}

export default function AddressesScreen({ navigation }: AddressesScreenProps) {
  // Address list state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    recipient: '',
    phoneNumber: '',
    street: '',
    commune: '',
    district: '',
    city: '',
    isDefault: false,
  });

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Selected codes for loading next level
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

  // Load addresses on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Reload addresses when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadAddresses();
    }, [])
  );

  // ============ DATA LOADING FUNCTIONS ============

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await addressService.getAddresses();
      if (response.success && response.data) {
        // Sắp xếp: địa chỉ mặc định lên đầu
        const sortedAddresses = response.data.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return 0;
        });
        
        setAddresses(sortedAddresses);
      } else {
        Alert.alert('Error', response.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setIsLoadingProvinces(true);
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      Alert.alert('Error', 'Failed to load provinces');
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: number | string) => {
    try {
      setIsLoadingDistricts(true);
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      Alert.alert('Error', 'Failed to load districts');
      setDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtCode: number | string) => {
    try {
      setIsLoadingWards(true);
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      Alert.alert('Error', 'Failed to load wards');
      setWards([]);
    } finally {
      setIsLoadingWards(false);
    }
  };

  // ============ MODAL HANDLERS ============

  const openAddModal = () => {
    navigation.navigate('AddEditAddress');
  };

  const openEditModal = (address: Address) => {
    navigation.navigate('AddEditAddress', { address });
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      recipient: '',
      phoneNumber: '',
      street: '',
      commune: '',
      district: '',
      city: '',
      isDefault: false,
    });
    setEditingAddress(null);
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setDistricts([]);
    setWards([]);
  };

  // ============ LOCATION SELECTION HANDLERS ============

  const handleProvincePress = () => {
    if (provinces.length === 0) {
      Alert.alert('Please wait', 'Loading provinces...');
      return;
    }
    setShowAddressModal(false);
    setTimeout(() => {
      setShowProvinceSelector(true);
    }, 300);
  };

  const handleSelectProvince = async (province: Province) => {
    const provinceCode = province.code || province.codename;
    setFormData(prev => ({
      ...prev,
      city: province.name,
      district: '',
      commune: '',
    }));
    setSelectedProvinceCode(provinceCode || '');
    setDistricts([]);
    setWards([]);
    setShowProvinceSelector(false);
    
    setTimeout(() => {
      setShowAddressModal(true);
    }, 300);
    
    if (provinceCode) {
      await fetchDistricts(provinceCode);
    }
  };

  const handleDistrictPress = () => {
    if (!formData.city) {
      Alert.alert('Notice', 'Please select province first');
      return;
    }
    if (districts.length === 0) {
      Alert.alert('Please wait', 'Loading districts...');
      return;
    }
    setShowAddressModal(false);
    setTimeout(() => {
      setShowDistrictSelector(true);
    }, 300);
  };

  const handleSelectDistrict = async (district: District) => {
    const districtCode = district.code || district.codename;
    setFormData(prev => ({
      ...prev,
      district: district.name,
      commune: '',
    }));
    setSelectedDistrictCode(districtCode || '');
    setWards([]);
    setShowDistrictSelector(false);
    
    setTimeout(() => {
      setShowAddressModal(true);
    }, 300);
    
    if (districtCode) {
      await fetchWards(districtCode);
    }
  };

  const handleWardPress = () => {
    if (!formData.district) {
      Alert.alert('Notice', 'Please select district first');
      return;
    }
    if (wards.length === 0) {
      Alert.alert('Please wait', 'Loading wards...');
      return;
    }
    setShowAddressModal(false);
    setTimeout(() => {
      setShowWardSelector(true);
    }, 300);
  };

  const handleSelectWard = (ward: Ward) => {
    setFormData(prev => ({
      ...prev,
      commune: ward.name,
    }));
    setShowWardSelector(false);
    setTimeout(() => {
      setShowAddressModal(true);
    }, 300);
  };

  // ============ SAVE ADDRESS ============

  const handleSaveAddress = async () => {
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
      if (editingAddress) {
        response = await addressService.updateAddress(editingAddress.id, addressData);
      } else {
        response = await addressService.createAddress(addressData);
      }

      if (response.success) {
        Alert.alert('Success', editingAddress ? 'Address updated' : 'Address added');
        closeAddressModal();
        loadAddresses();
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

  // ============ DELETE & SET DEFAULT ============

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressService.deleteAddress(addressId);
              if (response.success) {
                Alert.alert('Success', 'Address deleted');
                loadAddresses();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await addressService.updateAddress(addressId, { isDefault: true });
      if (response.success) {
        Alert.alert('Success', 'Default address updated');
        loadAddresses();
      } else {
        Alert.alert('Error', response.message || 'Failed to set default');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  // ============ RENDER FUNCTIONS ============

  const renderAddressCard = (address: Address) => (
    <View key={address.id} style={[
      styles.addressCard,
      address.isDefault && styles.addressCardDefault
    ]}>
      <View style={styles.addressHeader}>
        <View style={styles.recipientRow}>
          <Text style={styles.recipientName}>{address.recipient}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>✓ Mặc định</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.addressDetails}>
        <Text style={styles.phoneText}>📱 {address.phoneNumber}</Text>
        <Text style={styles.addressText}>
          📍 {address.street}, {address.commune}, {address.district}, {address.city}
        </Text>
      </View>

      <View style={styles.addressActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openEditModal(address)}
        >
          <Text style={styles.editButton}>✏️ Sửa</Text>
        </TouchableOpacity>
        
        {!address.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Text style={styles.setDefaultButton}>⭐ Đặt mặc định</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Text style={styles.deleteButton}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLocationSelector = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: any[],
    onSelect: (item: any) => void,
    isLoading: boolean
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.selectorModalOverlay} onPress={onClose}>
      <Pressable style={styles.selectorModal} onPress={(e) => e.stopPropagation()}>
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
              {items.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.selectorItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.selectorItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ============ MAIN RENDER ============

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Address List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyText}>No addresses yet</Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
            <Text style={styles.addFirstButtonText}>Add Your First Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {addresses.map(renderAddressCard)}
        </ScrollView>
      )}

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={closeAddressModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </Text>
              <TouchableOpacity onPress={closeAddressModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                <Pressable 
                  style={styles.selector} 
                  onPress={handleProvincePress}
                >
                  <Text style={formData.city ? styles.selectorTextFilled : styles.selectorTextEmpty}>
                    {formData.city || 'Select province/city'}
                  </Text>
                  <Text style={styles.selectorArrow}>▼</Text>
                </Pressable>
              </View>

              {/* District Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>District *</Text>
                <Pressable 
                  style={[styles.selector, !formData.city && styles.selectorDisabled]} 
                  onPress={handleDistrictPress}
                >
                  <Text style={formData.district ? styles.selectorTextFilled : styles.selectorTextEmpty}>
                    {formData.district || 'Select district'}
                  </Text>
                  <Text style={styles.selectorArrow}>▼</Text>
                </Pressable>
              </View>

              {/* Ward/Commune Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ward / Commune *</Text>
                <Pressable 
                  style={[styles.selector, !formData.district && styles.selectorDisabled]} 
                  onPress={handleWardPress}
                >
                  <Text style={formData.commune ? styles.selectorTextFilled : styles.selectorTextEmpty}>
                    {formData.commune || 'Select ward/commune'}
                  </Text>
                  <Text style={styles.selectorArrow}>▼</Text>
                </Pressable>
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
                onPress={handleSaveAddress}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Province Selector Modal */}
      {renderLocationSelector(
        showProvinceSelector,
        () => {
          setShowProvinceSelector(false);
          setTimeout(() => setShowAddressModal(true), 300);
        },
        'Select Province / City',
        provinces,
        handleSelectProvince,
        isLoadingProvinces
      )}

      {/* District Selector Modal */}
      {renderLocationSelector(
        showDistrictSelector,
        () => {
          setShowDistrictSelector(false);
          setTimeout(() => setShowAddressModal(true), 300);
        },
        'Select District',
        districts,
        handleSelectDistrict,
        isLoadingDistricts
      )}

      {/* Ward Selector Modal */}
      {renderLocationSelector(
        showWardSelector,
        () => {
          setShowWardSelector(false);
          setTimeout(() => setShowAddressModal(true), 300);
        },
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
  addButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressCardDefault: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  addressHeader: {
    marginBottom: 12,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addressDetails: {
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  editButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  setDefaultButton: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  deleteButton: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  selector: {
    backgroundColor: '#f5f5f5',
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
  selectorModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
    zIndex: 10000,
    elevation: 10,
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
  selectorList: {
    flex: 1,
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
});
