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

interface AddressesScreenProps {
  navigation: any;
}

export default function AddressesScreen({ navigation }: AddressesScreenProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form state (match addressService fields)
  const [recipient, setRecipient] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [commune, setCommune] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  // Location state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [wardsList, setWardsList] = useState<Ward[]>([]);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  useEffect(() => {
    loadAddresses();
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const data = await locationService.getProvinces();
      setProvinces(data || []);
    } catch (err) {
      console.error('Failed loading provinces', err);
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistrictsList(data || []);
    } catch (err) {
      console.error('Failed loading districts', err);
      setDistrictsList([]);
    }
  };

  const loadWards = async (districtCode: string) => {
    try {
      const data = await locationService.getWards(districtCode);
      setWardsList(data || []);
    } catch (err) {
      console.error('Failed loading wards', err);
      setWardsList([]);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
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

  const resetForm = () => {
    setRecipient('');
    setPhoneNumber('');
    setStreet('');
    setCommune('');
    setDistrict('');
    setCity('');
    setIsDefault(false);
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setRecipient(address.recipient || '');
    setPhoneNumber(address.phoneNumber || '');
    setStreet(address.street || '');
    setCommune(address.commune || '');
    setDistrict(address.district || '');
    setCity(address.city || '');
    setIsDefault(!!address.isDefault);
    setShowModal(true);
  };

  const handleSaveAddress = async () => {
    if (!recipient.trim() || !phoneNumber.trim() || !street.trim() || 
        !commune.trim() || !district.trim() || !city.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const addressData = {
        recipient,
        phoneNumber,
        street,
        commune,
        district,
        city,
        isDefault,
        addressType: 'HOME' as AddressType,
      };

      let response;
      if (editingAddress) {
        response = await addressService.updateAddress(editingAddress.id, addressData);
      } else {
        response = await addressService.createAddress(addressData);
      }

      if (response.success) {
        setShowModal(false);
        resetForm();
        loadAddresses();
        Alert.alert('Success', editingAddress ? 'Address updated successfully' : 'Address added successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

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
              setIsLoading(true);
              const response = await addressService.deleteAddress(addressId);
              if (response.success) {
                loadAddresses();
                Alert.alert('Success', 'Address deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete address');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setIsLoading(true);
      // Server should unset other defaults when this is set
      const response = await addressService.updateAddress(addressId, { isDefault: true });
      if (response.success) {
        loadAddresses();
        Alert.alert('Success', 'Default address updated');
      } else {
        Alert.alert('Error', response.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddress = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressHeaderLeft}>
          <Text style={styles.recipientName}>{address.recipient}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.recipientPhone}>{address.phoneNumber}</Text>
      <Text style={styles.addressText}>
        {address.street}, {address.commune || ''} {address.district}, {address.city}
      </Text>

      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(address)}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Text style={styles.defaultActionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading && addresses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyText}>No addresses yet</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
                <Text style={styles.addFirstButtonText}>Add Your First Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map(renderAddress)
          )}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Recipient Name *</Text>
                <TextInput
                  style={styles.input}
                  value={recipient}
                  onChangeText={setRecipient}
                  placeholder="Enter recipient name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

            

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Province / City *</Text>
                <TouchableOpacity style={[styles.input, styles.selector]} onPress={() => setShowProvinceModal(true)} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: city ? '#000' : '#999' }}>{city || 'Select province/city'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>District *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selector]}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => {
                    if (!city) return Alert.alert('Please select province/city first');
                    setShowDistrictModal(true);
                  }}
                >
                  <Text style={{ color: district ? '#000' : '#999' }}>{district || 'Select district'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ward / Commune *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selector]}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => {
                    if (!district) return Alert.alert('Please select district first');
                    setShowWardModal(true);
                  }}
                >
                  <Text style={{ color: commune ? '#000' : '#999' }}>{commune || 'Select ward/commune'}</Text>
                </TouchableOpacity>
              </View>
                <View style={styles.inputContainer}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="House number, street name"
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsDefault(!isDefault)}
              >
                <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                  {isDefault && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Province modal */}
      <Modal visible={showProvinceModal} transparent animationType="slide" onRequestClose={() => setShowProvinceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Province / City</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {provinces.map(p => (
                <TouchableOpacity key={p.code} style={styles.listItem} activeOpacity={0.8} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} onPress={() => {
                  setCity(p.name);
                  setDistrict('');
                  setCommune('');
                  // load districts by province code
                  loadDistricts(p.code);
                  setShowProvinceModal(false);
                }}>
                  <Text style={styles.listItemText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* District modal */}
      <Modal visible={showDistrictModal} transparent animationType="slide" onRequestClose={() => setShowDistrictModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {districtsList.map(d => (
                <TouchableOpacity key={d.code} style={styles.listItem} activeOpacity={0.8} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} onPress={() => {
                  setDistrict(d.name);
                  setCommune('');
                  loadWards(d.code);
                  setShowDistrictModal(false);
                }}>
                  <Text style={styles.listItemText}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Ward modal */}
      <Modal visible={showWardModal} transparent animationType="slide" onRequestClose={() => setShowWardModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Ward / Commune</Text>
              <TouchableOpacity onPress={() => setShowWardModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {wardsList.map(w => (
                <TouchableOpacity key={w.code} style={styles.listItem} activeOpacity={0.8} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} onPress={() => {
                  setCommune(w.name);
                  setShowWardModal(false);
                }}>
                  <Text style={styles.listItemText}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
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
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    paddingVertical: 4,
  },
  editText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  defaultActionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalBody: {
    padding: 8,
  },
  listItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  inputContainer: {
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
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selector: {
    justifyContent: 'center',
    height: 44,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
