"use client";

import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Tag, Form, Input, Select, Radio, message } from "antd";
import { 
  EnvironmentOutlined,
  EditOutlined,
  PlusOutlined,
  HomeOutlined,
  ShopOutlined
} from "@ant-design/icons";
import { locationService, type Province, type District, type Ward } from "@/services/locationService";

const { TextArea } = Input;
const { Option } = Select;

// Types for delivery address
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
  type: 'home' | 'office' | 'other';
}



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

  // Handle mounting for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load provinces only after component is mounted
  useEffect(() => {
    if (mounted) {
      loadProvinces();
    }
  }, [mounted]);

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

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    addressForm.resetFields();
    setSelectedCity("");
    setSelectedDistrict("");
    setAddAddressModalVisible(true);
  };

  const handleEditAddress = async (address: DeliveryAddress) => {
    setEditingAddress(address);
    addressForm.setFieldsValue({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.cityCode,
      district: address.districtCode,
      ward: address.wardCode,
      type: address.type
    });
    
    // Load location data for editing
    setSelectedCity(address.cityCode);
    setSelectedDistrict(address.districtCode);
    
    // Load districts for the selected city
    if (address.cityCode) {
      await loadDistricts(address.cityCode);
    }
    
    // Load wards for the selected district
    if (address.districtCode) {
      await loadWards(address.districtCode);
    }
    
    setAddAddressModalVisible(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    Modal.confirm({
      title: 'Delete Address',
      content: 'Are you sure you want to delete this address?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const newAddresses = addresses.filter(addr => addr.id !== addressId);
        onAddressesChange(newAddresses);
        
        if (selectedAddressId === addressId && newAddresses.length > 0) {
          onSelectedAddressChange(newAddresses[0].id);
        }
      }
    });
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    onAddressesChange(newAddresses);
  };

  const handleSaveAddress = async (values: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    type: 'home' | 'office' | 'other';
  }) => {
    try {
      // Get the full names from the API data
      const province = provinces.find(p => p.code === values.city);
      const district = districts.find(d => d.code === values.district);
      const ward = wards.find(w => w.code === values.ward);

      if (!province || !district || !ward) {
        message.error('Please select valid location');
        return;
      }

      if (editingAddress) {
        // Update existing address
        const newAddresses = addresses.map(addr => 
          addr.id === editingAddress.id 
            ? {
                ...addr,
                ...values,
                city: province.name,
                cityCode: province.code,
                district: district.name,
                districtCode: district.code,
                ward: ward.name,
                wardCode: ward.code
              }
            : addr
        );
        onAddressesChange(newAddresses);
        message.success('Address updated successfully!');
      } else {
        // Add new address
        const newAddress: DeliveryAddress = {
          id: Date.now().toString(),
          ...values,
          city: province.name,
          cityCode: province.code,
          district: district.name,
          districtCode: district.code,
          ward: ward.name,
          wardCode: ward.code,
          isDefault: addresses.length === 0
        };
        onAddressesChange([...addresses, newAddress]);
        onSelectedAddressChange(newAddress.id);
        message.success('Address added successfully!');
      }
      
      setAddAddressModalVisible(false);
      addressForm.resetFields();
      setSelectedCity("");
      setSelectedDistrict("");
      setDistricts([]);
      setWards([]);
    } catch (error) {
      console.error('Failed to save address:', error);
      message.error('Failed to save address. Please try again.');
    }
  };

  if (!selectedAddress) {
    return null;
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
          >
            Change
          </Button>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="text-orange-500 mr-2">
                  {selectedAddress.type === 'home' ? <HomeOutlined /> : 
                   selectedAddress.type === 'office' ? <ShopOutlined /> : 
                   <EnvironmentOutlined />}
                </div>
                <span className="font-medium text-gray-800">{selectedAddress.name}</span>
                {selectedAddress.isDefault && <Tag color="red" className="ml-2">Default</Tag>}
              </div>
              <div className="text-gray-600 mt-1">{selectedAddress.phone}</div>
              <div className="text-gray-600 mt-2">
                {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
              </div>
            </div>
          </div>
        </div>
      </Card>

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
          
          {addresses.map(address => (
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
                      {address.type === 'home' ? <HomeOutlined /> : 
                       address.type === 'office' ? <ShopOutlined /> : 
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
                <div className="flex flex-col space-y-1">
                  <Button 
                    type="link" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}
                  >
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefaultAddress(address.id);
                        }}
                      >
                        Set Default
                      </Button>
                      <Button 
                        type="link" 
                        size="small" 
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                { pattern: /^[0-9]{10,11}$/, message: 'Please enter valid phone number' }
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

          <Form.Item
            name="type"
            label="Address Type"
            rules={[{ required: true, message: 'Please select address type' }]}
          >
            <Radio.Group>
              <Radio value="home">
                <HomeOutlined className="mr-1" />
                Home
              </Radio>
              <Radio value="office">
                <ShopOutlined className="mr-1" />
                Office
              </Radio>
              <Radio value="other">
                <EnvironmentOutlined className="mr-1" />
                Other
              </Radio>
            </Radio.Group>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="city"
              label="City/Province"
              rules={[{ required: true, message: 'Please select city' }]}
            >
              <Select
                placeholder={loadingProvinces ? "Loading provinces..." : "Select city"}
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
              label="Ward"
              rules={[{ required: true, message: 'Please select ward' }]}
            >
              <Select
                placeholder="Select ward"
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