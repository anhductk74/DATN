"use client";

import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Tag, Form, Input, Select, Radio } from "antd";
import { 
  EnvironmentOutlined,
  EditOutlined,
  PlusOutlined,
  HomeOutlined,
  ShopOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { locationService, type Province, type District, type Ward } from "@/services/LocationService";
import addressService, { type Address, type CreateAddressRequest, type UpdateAddressRequest, type AddressType } from "@/services/AddressService";
import { useAuth } from "@/contexts/AuthContext";
import { useAntdApp } from "@/hooks/useAntdApp";

const { TextArea } = Input;
const { Option } = Select;

// Types for delivery address (UI format)
export interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  wardCode: string;
  district: string;
  districtCode: string;
  city: string;
  cityCode: string;
  isDefault: boolean;
  type: AddressType;
}

// Transform API Address to UI DeliveryAddress
const transformApiAddressToLocal = (apiAddress: Address): DeliveryAddress => {
  return {
    id: apiAddress.id,
    name: apiAddress.recipient,
    phone: apiAddress.phoneNumber,
    address: apiAddress.street,
    ward: apiAddress.commune,
    wardCode: "", // API doesn't provide codes
    district: apiAddress.district,
    districtCode: "",
    city: apiAddress.city,
    cityCode: "",
    isDefault: apiAddress.isDefault,
    type: apiAddress.addressType
  };
};

interface DeliveryAddressProps {
  addresses: DeliveryAddress[];
  selectedAddressId: string;
  onAddressesChange: (addresses: DeliveryAddress[]) => void;
  onSelectedAddressChange: (addressId: string) => void;
}

export default function DeliveryAddress({ 
  addresses, 
  selectedAddressId, 
  onAddressesChange, 
  onSelectedAddressChange 
}: DeliveryAddressProps) {
  const { status } = useAuth();
  const { message, modal } = useAntdApp();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [addressForm] = Form.useForm();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  // Location data state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Handle mounting for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load addresses from API
  useEffect(() => {
    console.log('DeliveryAddress useEffect:', { mounted, status });
    if (mounted && status === 'authenticated') {
      console.log('Loading addresses from API...');
      loadAddressesFromAPI();
    }
  }, [mounted, status]);

  // Load provinces only after component is mounted
  useEffect(() => {
    if (mounted) {
      loadProvinces();
    }
  }, [mounted]);

  const loadAddressesFromAPI = async () => {
    setLoadingAddresses(true);
    try {
      console.log('Calling addressService.getAddresses()...');
      const apiAddresses = await addressService.getAddresses();
      console.log('API Response:', apiAddresses);
      const transformedAddresses = apiAddresses.map(transformApiAddressToLocal);
      console.log('Transformed addresses:', transformedAddresses);
      onAddressesChange(transformedAddresses);
      
      // Set default address or first address as selected
      if (transformedAddresses.length > 0 && !selectedAddressId) {
        const defaultAddress = transformedAddresses.find((addr: DeliveryAddress) => addr.isDefault);
        const selectedId = defaultAddress?.id || transformedAddresses[0].id;
        console.log('Setting selected address:', selectedId);
        onSelectedAddressChange(selectedId);
      }
    } catch (error: any) {
      console.error('Failed to load addresses:', error);
      console.error('Error details:', error?.response);
      message.error(error?.response?.data?.message || 'Failed to load address list');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      console.log('Loading provinces...');
      const data = await locationService.getProvinces();
      console.log('Provinces loaded:', data.length);
      setProvinces(data);
      if (data.length === 0) {
        message.warning('No provinces data available');
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
      message.error('Failed to load provinces. Please try again.');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      message.error('Failed to load districts');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode: string) => {
    setLoadingWards(true);
    setWards([]);
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      message.error('Failed to load wards');
    } finally {
      setLoadingWards(false);
    }
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId) || addresses[0];

  const handleAddressSelect = (addressId: string) => {
    onSelectedAddressChange(addressId);
    setAddressModalVisible(false);
  };

  const handleAddNewAddress = async () => {
    console.log('handleAddNewAddress called');
    setEditingAddress(null);
    addressForm.resetFields();
    setSelectedCity("");
    setSelectedDistrict("");
    setDistricts([]);
    setWards([]);
    
    // Ensure provinces are loaded before opening modal
    if (provinces.length === 0) {
      console.log('Loading provinces before opening modal...');
      await loadProvinces();
    }
    
    console.log('Opening add address modal');
    setAddAddressModalVisible(true);
  };

  const handleEditAddress = async (address: DeliveryAddress) => {
    try {
      setEditingAddress(address);
      
      // Reset form and location states
      setSelectedCity("");
      setSelectedDistrict("");
      setDistricts([]);
      setWards([]);
      
      // Ensure provinces are loaded
      if (provinces.length === 0) {
        console.log('Loading provinces for edit...');
        await loadProvinces();
      }
      
      // Since API doesn't provide codes, we need to find them by name
      let cityCode = "";
      let districtCode = "";
      let wardCode = "";
      
      // Find city code by name
      const foundProvince = provinces.find(p => p.name === address.city);
      if (foundProvince) {
        cityCode = foundProvince.code;
        setSelectedCity(cityCode);
        
        // Load districts for the city
        const loadedDistricts = await new Promise<District[]>((resolve) => {
          loadDistricts(foundProvince.code).then(() => {
            // Wait a bit for state to update
            setTimeout(() => {
              resolve(districts);
            }, 100);
          });
        });
        
        // Get districts directly from API to ensure we have the latest data
        const currentDistricts = await locationService.getDistricts(foundProvince.code);
        setDistricts(currentDistricts);
        
        // Find district code by name
        const foundDistrict = currentDistricts.find(d => d.name === address.district);
        if (foundDistrict) {
          districtCode = foundDistrict.code;
          setSelectedDistrict(districtCode);
          
          // Load wards for the district
          const currentWards = await locationService.getWards(foundDistrict.code);
          setWards(currentWards);
          
          // Find ward code by name
          const foundWard = currentWards.find(w => w.name === address.ward);
          if (foundWard) {
            wardCode = foundWard.code;
          }
        }
      }
      
      // Set form values after all location data is processed
      addressForm.setFieldsValue({
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: cityCode || undefined,
        district: districtCode || undefined,
        ward: wardCode || undefined,
        type: address.type
      });
      
      if (!cityCode) {
        message.warning('Location data needs to be reselected for this address');
      }
      
      setAddAddressModalVisible(true);
    } catch (error) {
      console.error('Error in handleEditAddress:', error);
      message.error('Failed to load address data for editing');
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    console.log('handleDeleteAddress called with ID:', addressId);
    console.log('Current addresses:', addresses);
    
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    
    if (!addressToDelete) {
      console.error('Address not found with ID:', addressId);
      message.error('Address not found');
      return;
    }
    
    console.log('Address to delete:', addressToDelete);
    
    // Cannot delete default address (backend will prevent this)
    if (addressToDelete.isDefault) {
      console.log('Cannot delete default address');
      message.warning({
        content: 'Cannot delete default address. Please set another address as default first.',
        duration: 4
      });
      return;
    }
    
    modal.confirm({
      title: (
        <div className="flex items-center text-lg">
          <DeleteOutlined className="text-red-500 mr-3 text-xl" />
          <span className="font-semibold">Remove Address</span>
        </div>
      ),
      content: (
        <div className="py-3">
          <p className="mb-4 text-gray-700 text-base">
            Are you sure you want to remove this address from your delivery options?
          </p>
          
          {/* Address Preview Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 mb-4">
            <div className="flex items-start">
              <div className="text-orange-500 mr-3 text-lg mt-1">
                {addressToDelete.type === 'HOME' ? <HomeOutlined /> : 
                 addressToDelete.type === 'WORK' ? <ShopOutlined /> : 
                 <EnvironmentOutlined />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-base mb-1">
                  {addressToDelete.name}
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  📱 {addressToDelete.phone}
                </div>
                <div className="text-gray-600 text-sm leading-relaxed">
                  📍 {addressToDelete.address}, {addressToDelete.ward}, {addressToDelete.district}, {addressToDelete.city}
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start">
              <div className="text-blue-500 mr-2 mt-0.5">ℹ️</div>
              <div className="text-blue-700 text-sm">
                <strong>Don't worry!</strong> This address will be safely archived and can be restored by contacting support if needed.
              </div>
            </div>
          </div>
        </div>
      ),
      okText: (
        <span className="flex items-center">
          <DeleteOutlined className="mr-2" />
          Remove Address
        </span>
      ),
      cancelText: (
        <span className="flex items-center">
          Keep Address
        </span>
      ),
      okType: 'danger',
      width: 550,
      centered: true,
      maskClosable: false,
      keyboard: false,
      onOk: async () => {
        const hideLoading = message.loading(
          <span className="flex items-center">
            <DeleteOutlined className="mr-2 animate-pulse" />
            Removing address...
          </span>, 
          0
        );
        try {
          console.log('Starting delete process for address ID:', addressId);
          console.log('Address ID type:', typeof addressId);
          
          // Call soft delete API (backend changes status to INACTIVE)
          const deleteResponse = await addressService.deleteAddress(addressId);
          console.log('Soft delete API response:', deleteResponse);
          
          hideLoading();
          
          // Show success message first
          message.success({
            content: (
              <span className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Address removed successfully!
              </span>
            ),
            duration: 4
          });
          
          // Close the address modal if it's open
          setAddressModalVisible(false);
          
          // Get updated addresses from API (backend now filters out INACTIVE addresses)
          console.log('Fetching updated addresses after soft delete...');
          
          const apiAddresses = await addressService.getAddresses();
          console.log('Updated addresses from API (ACTIVE only):', apiAddresses);
          
          const updatedAddresses = apiAddresses.map(transformApiAddressToLocal);
          console.log('Transformed updated addresses:', updatedAddresses);
          
          // Update addresses state (deleted address won't appear as it's now INACTIVE)
          onAddressesChange(updatedAddresses);
          console.log('Addresses updated in parent component');
          
          // If the deleted address was selected, select another one
          if (selectedAddressId === addressId) {
            console.log('Deleted address was selected, choosing new one...');
            if (updatedAddresses.length > 0) {
              const defaultAddress = updatedAddresses.find(addr => addr.isDefault);
              const newSelectedId = defaultAddress?.id || updatedAddresses[0].id;
              console.log('Setting new selected address:', newSelectedId);
              onSelectedAddressChange(newSelectedId);
            } else {
              console.log('No addresses remaining, clearing selection');
              onSelectedAddressChange('');
            }
          }
          
        } catch (error: any) {
          hideLoading();
          console.error('Delete failed - Full error:', error);
          console.error('Delete failed - Error response:', error?.response);
          console.error('Delete failed - Error data:', error?.response?.data);
          console.error('Delete failed - Error status:', error?.response?.status);
          
          let errorMessage = 'Failed to delete address. Please try again.';
          
          if (error?.response?.status === 404) {
            errorMessage = 'Address not found or has been already deleted.';
          } else if (error?.response?.status === 403) {
            errorMessage = 'You do not have permission to delete this address.';
          } else if (error?.response?.status === 400) {
            errorMessage = 'Cannot delete this address. It may be a default address.';
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          
          message.error({
            content: errorMessage,
            duration: 4
          });
        }
      }
    });
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      // Update the address to set it as default
      await addressService.updateAddress(addressId, { isDefault: true });
      
      // Reload addresses to reflect the change
      await loadAddressesFromAPI();
      
      message.success('Set as default address successfully');
    } catch (error: any) {
      console.error('Failed to set default address:', error);
      message.error(error?.response?.data?.message || 'Failed to set default address');
    }
  };

  const handleSaveAddress = async (values: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    type: AddressType;
  }) => {
    setSavingAddress(true);
    try {
      // Get the full names from the API data
      const province = provinces.find((p: Province) => p.code === values.city);
      const district = districts.find((d: District) => d.code === values.district);
      const ward = wards.find((w: Ward) => w.code === values.ward);

      if (!province || !district || !ward) {
        message.error('Please select a valid address');
        return;
      }

      if (editingAddress) {
        // Update existing address via API
        const updateData: UpdateAddressRequest = {
          recipient: values.name,
          phoneNumber: values.phone,
          addressType: values.type,
          street: values.address,
          commune: ward.name,
          district: district.name,
          city: province.name
        };
        
        await addressService.updateAddress(editingAddress.id, updateData);
        message.success('Address updated successfully!');
      } else {
        // Create new address via API
        const createData: CreateAddressRequest = {
          recipient: values.name,
          phoneNumber: values.phone,
          addressType: values.type,
          street: values.address,
          commune: ward.name,
          district: district.name,
          city: province.name,
          isDefault: addresses.length === 0 // First address is default
        };
        
        const newAddress = await addressService.createAddress(createData);
        onSelectedAddressChange(newAddress.id);
        message.success('New address added successfully!');
      }
      
      // Reload addresses from API
      await loadAddressesFromAPI();
      
      setAddAddressModalVisible(false);
      addressForm.resetFields();
      setSelectedCity("");
      setSelectedDistrict("");
      setDistricts([]);
      setWards([]);
    } catch (error: any) {
      console.error('Failed to save address:', error);
      message.error(error?.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  if (!selectedAddress && loadingAddresses) {
    return (
      <>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading addresses...</p>
            </div>
          </div>
        </Card>
        {renderAddressModals()}
      </>
    );
  }

  if (!selectedAddress && !loadingAddresses) {
    // No addresses available - show empty state with add button
    return (
      <>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <EnvironmentOutlined className="text-orange-500 text-lg mr-2" />
              <span className="text-lg font-medium">Delivery Address</span>
            </div>
          </div>
          <div className="bg-orange-50 p-8 rounded-lg text-center">
            <EnvironmentOutlined className="text-4xl text-orange-300 mb-4" />
            <p className="text-gray-600 mb-4">No delivery address yet</p>
            <p className="text-gray-500 text-sm mb-6">Please add a delivery address to continue</p>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNewAddress}
              className="bg-orange-500 hover:bg-orange-600 border-orange-500"
            >
              Add New Address
            </Button>
          </div>
        </Card>
        {renderAddressModals()}
      </>
    );
  }

  // Function to render address modals (reusable)
  function renderAddressModals() {
    return (
      <>
        {/* Address Selection Modal */}
        <Modal
          title="Select Delivery Address"
          open={addressModalVisible}
          onCancel={() => setAddressModalVisible(false)}
          footer={null}
          width={700}
        >
          <div className="space-y-4">
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              className="w-full h-12 border-orange-300 text-orange-500 hover:border-orange-400"
              onClick={handleAddNewAddress}
            >
              Add New Address
            </Button>
            
            {loadingAddresses ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading...</p>
                </div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <EnvironmentOutlined className="text-4xl mb-2" />
                <p>No addresses yet</p>
                <p className="text-sm">Please add a delivery address</p>
              </div>
            ) : (
              addresses.map(address => (
              <div 
                key={address.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAddressId === address.id 
                    ? 'border-orange-300 bg-orange-50 shadow-md' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
                onClick={() => handleAddressSelect(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="text-orange-500 mr-2">
                        {address.type === 'HOME' ? <HomeOutlined /> : 
                         address.type === 'WORK' ? <ShopOutlined /> : 
                         <EnvironmentOutlined />}
                      </div>
                      <span className="font-medium text-gray-800">{address.name}</span>
                      {address.isDefault && <Tag color="red" className="ml-2">Default</Tag>}
                    </div>
                    <div className="text-gray-600 mb-1">{address.phone}</div>
                    <div className="text-gray-600">
                      {address.address}, {address.ward}, {address.district}, {address.city}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <Button 
                        type="text" 
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit address"
                      >
                        Edit
                      </Button>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<EnvironmentOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefaultAddress(address.id);
                        }}
                        disabled={address.isDefault}
                        className={address.isDefault ? "text-gray-400" : "text-green-500 hover:text-green-700 hover:bg-green-50"}
                        title={address.isDefault ? 'Already default address' : 'Set as default address'}
                      >
                        {address.isDefault ? 'Default' : 'Set Default'}
                      </Button>
                    </div>
                    {!address.isDefault && (
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Delete button clicked for address:', address.id);
                          handleDeleteAddress(address.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 self-start"
                        title="Delete address"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </Modal>

        {/* Add/Edit Address Modal */}
        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          open={addAddressModalVisible}
          onCancel={() => {
            setAddAddressModalVisible(false);
            addressForm.resetFields();
            setEditingAddress(null);
          }}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleSaveAddress}
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Invalid phone number' }
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </div>

            <Form.Item
              name="type"
              label="Address Type"
              rules={[{ required: true, message: 'Please select address type' }]}
              initialValue="HOME"
            >
              <Radio.Group>
                <Radio value="HOME">
                  <HomeOutlined className="mr-1" />
                  Home
                </Radio>
                <Radio value="WORK">
                  <ShopOutlined className="mr-1" />
                  Work
                </Radio>
                <Radio value="OTHER">
                  <EnvironmentOutlined className="mr-1" />
                  Other
                </Radio>
              </Radio.Group>
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="city"
                label="Province/City"
                rules={[{ required: true, message: 'Please select province/city' }]}
              >
                <Select
                  placeholder={loadingProvinces ? "Loading..." : "Select province/city"}
                  loading={loadingProvinces}
                  disabled={!mounted || loadingProvinces}
                  onChange={(value) => {
                    setSelectedCity(value);
                    setSelectedDistrict("");
                    addressForm.setFieldsValue({ district: undefined, ward: undefined });
                    loadDistricts(value);
                  }}
                  notFoundContent={loadingProvinces ? "Loading..." : "No data"}
                >
                  {provinces.map(province => (
                    <Option key={province.code} value={province.code}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: 'Please select district' }]}
              >
                <Select
                  placeholder="Select district"
                  loading={loadingDistricts}
                  disabled={!selectedCity}
                  onChange={(value) => {
                    setSelectedDistrict(value);
                    addressForm.setFieldsValue({ ward: undefined });
                    loadWards(value);
                  }}
                >
                  {districts.map(district => (
                    <Option key={district.code} value={district.code}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ward"
                label="Ward/Commune"
                rules={[{ required: true, message: 'Please select ward/commune' }]}
              >
                <Select
                  placeholder="Select ward/commune"
                  loading={loadingWards}
                  disabled={!selectedDistrict}
                >
                  {wards.map(ward => (
                    <Option key={ward.code} value={ward.code}>
                      {ward.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="address"
              label="Detailed Address"
              rules={[{ required: true, message: 'Please enter detailed address' }]}
            >
              <TextArea
                rows={3}
                placeholder="Enter house number, street name..."
              />
            </Form.Item>

            <div className="flex justify-end space-x-3 pt-4">
              <Button onClick={() => setAddAddressModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={savingAddress}
                className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </Form>
        </Modal>
      </>
    );
  }

  return (
    <>
      {/* Delivery Address Card */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <EnvironmentOutlined className="text-orange-500 text-lg mr-2" />
            <span className="text-lg font-medium">Delivery Address</span>
          </div>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => setAddressModalVisible(true)}
            className="text-blue-500"
            loading={loadingAddresses}
          >
            Change
          </Button>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="text-orange-500 mr-3 text-lg">
                  {selectedAddress.type === 'HOME' ? <HomeOutlined /> : 
                   selectedAddress.type === 'WORK' ? <ShopOutlined /> : 
                   <EnvironmentOutlined />}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 text-base">{selectedAddress.name}</span>
                  {selectedAddress.isDefault && (
                    <Tag color="orange" className="ml-2 text-xs">
                      <EnvironmentOutlined className="mr-1" />
                      Default
                    </Tag>
                  )}
                </div>
              </div>
              <div className="space-y-1 ml-8">
                <div className="text-gray-700 font-medium">{selectedAddress.phone}</div>
                <div className="text-gray-600 leading-relaxed">
                  {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <Button 
                type="text" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditAddress(selectedAddress)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                title="Edit this address"
              >
                Edit
              </Button>
              {!selectedAddress.isDefault && addresses.length > 1 && (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => {
                    console.log('Main card delete button clicked for address:', selectedAddress.id);
                    handleDeleteAddress(selectedAddress.id);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete this address"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {renderAddressModals()}
    </>
  );
}