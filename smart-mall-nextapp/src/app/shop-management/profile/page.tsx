"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Row, 
  Col, 
  Avatar, 
  Typography,
  Divider,
  Spin,
  Space,
  Select,
  App
} from "antd";
import { 
  EditOutlined,
  CameraOutlined,
  SaveOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import type { UploadFile } from 'antd/es/upload/interface';
import shopService, { Shop, UpdateShopData } from "@/services/ShopService";
import { getCloudinaryUrl } from "@/config/config";
import { locationService, Province, District, Ward } from "@/services/LocationService";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ShopProfile() {
  const { data: session } = useSession();
  const { message } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchShopData();
    }
    // Load provinces on component mount
    fetchProvinces();
  }, [session]);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
      message.error('Failed to load provinces');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
      setWards([]); // Clear wards when province changes
    } catch (error) {
      console.error('Error loading districts:', error);
      message.error('Failed to load districts');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtCode: string) => {
    setLoadingWards(true);
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
      message.error('Failed to load wards');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict('');
    setSelectedWard('');
    const province = provinces.find(p => p.code === value);
    if (province) {
      form.setFieldsValue({ 
        city: province.name,
        district: undefined,
        commune: undefined
      });
      fetchDistricts(value);
    }
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedWard('');
    const district = districts.find(d => d.code === value);
    if (district) {
      form.setFieldsValue({ 
        district: district.name,
        commune: undefined
      });
      fetchWards(value);
    }
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
    const ward = wards.find(w => w.code === value);
    if (ward) {
      form.setFieldsValue({ commune: ward.name });
    }
  };

  // Set form values when shop data is loaded
  useEffect(() => {
    if (shop) {
      form.setFieldsValue({
        name: shop.name,
        description: shop.description,
        phoneNumber: shop.numberPhone,
        cccd: shop.cccd || '',
        street: shop.address?.street || '',
        commune: shop.address?.commune || '',
        district: shop.address?.district || '',
        city: shop.address?.city || ''
      });

      // Pre-load districts and wards if address exists
      if (shop.address?.city && provinces.length > 0) {
        const province = provinces.find(p => p.name === shop.address?.city);
        if (province) {
          setSelectedProvince(province.code);
          // Load districts first
          loadDistrictsAndWards(province.code, shop.address?.district);
        }
      }
    }
  }, [shop, form, provinces]);

  // Helper function to load districts and wards when editing existing address
  const loadDistrictsAndWards = async (provinceCode: string, districtName?: string) => {
    setLoadingDistricts(true);
    try {
      const districtData = await locationService.getDistricts(provinceCode);
      setDistricts(districtData);
      
      // If we have a district name, find and load its wards
      if (districtName && districtData.length > 0) {
        const district = districtData.find(d => d.name === districtName);
        if (district) {
          setSelectedDistrict(district.code);
          // Load wards for this district
          setLoadingWards(true);
          try {
            const wardData = await locationService.getWards(district.code);
            setWards(wardData);
            
            // Find and set the ward if we have commune data
            if (shop?.address?.commune && wardData.length > 0) {
              const ward = wardData.find(w => w.name === shop.address?.commune);
              if (ward) {
                setSelectedWard(ward.code);
              }
            }
          } catch (error) {
            console.error('Error loading wards:', error);
          } finally {
            setLoadingWards(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchShopData = async () => {
    if (!session?.user?.id) {
      message.warning('Please login to view shop profile');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await shopService.getShopsByOwner(session.user.id);
      const shops = response.data;
      
      if (shops && shops.length > 0) {
        setShop(shops[0]);
      } else {
        message.info('No shop found. Please create a shop first.');
      }
    } catch (error: any) {
      console.error('Error fetching shop:', error);
      message.error('Failed to load shop information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    if (!shop?.id) {
      message.error('Shop not found');
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateShopData = {
        name: values.name,
        description: values.description,
        phoneNumber: values.phoneNumber,
        cccd: values.cccd,
        address: {
          street: values.street,
          commune: values.commune,
          district: values.district,
          city: values.city
        }
      };

      const response = await shopService.updateShop(
        shop.id,
        updateData,
        avatarFile || undefined
      );

      message.success('Shop profile updated successfully!');
      setShop(response.data);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating shop:', error);
      message.error(error.response?.data?.message || 'Failed to update shop profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.originFileObj) {
      setAvatarFile(info.file.originFileObj);
    }
  };

  const beforeAvatarUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }
    return false; // Prevent auto upload
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }

  if (!shop) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text className="text-gray-500">No shop found. Please create a shop first.</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <Card>
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar 
              size={120} 
              src={avatarFile ? URL.createObjectURL(avatarFile) : (shop.avatar ? getCloudinaryUrl(shop.avatar) : undefined)}
              icon={!shop.avatar && !avatarFile ? <UserOutlined /> : undefined}
            />
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <Upload
                  showUploadList={false}
                  beforeUpload={beforeAvatarUpload}
                  onChange={handleAvatarChange}
                >
                  <Button size="small" shape="circle" icon={<CameraOutlined />} />
                </Upload>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Title level={2} className="mb-0">{shop.name}</Title>
              <Space>
                {isEditing && (
                  <Button onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                    fetchShopData();
                  }}>
                    Cancel
                  </Button>
                )}
                <Button 
                  type={isEditing ? "primary" : "default"}
                  icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                  loading={saving}
                  onClick={() => isEditing ? form.submit() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Space>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <PhoneOutlined />
                <Text>{shop.numberPhone}</Text>
              </div>
              {shop.cccd && (
                <div className="flex items-center gap-2 text-gray-600">
                  <IdcardOutlined />
                  <Text>CCCD: {shop.cccd}</Text>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <EnvironmentOutlined />
                <Text>
                  {[shop.address?.street, shop.address?.commune, shop.address?.district, shop.address?.city]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserOutlined />
                <Text>Owner: {shop.ownerName}</Text>
              </div>
            </div>
            
            {shop.description && (
              <>
                <Divider />
                <Text className="text-gray-600">{shop.description}</Text>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Shop Details Form */}
      <Card title="Shop Information">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!isEditing}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="name" 
                label="Shop Name" 
                rules={[{ required: true, message: 'Please enter shop name' }]}
              >
                <Input placeholder="Enter shop name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="phoneNumber" 
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Phone number must be exactly 10 digits' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="cccd" 
                label="Citizen ID (CCCD)"
                rules={[
                  { pattern: /^[0-9]{12}$/, message: 'CCCD must be exactly 12 digits' }
                ]}
              >
                <Input 
                  placeholder="Enter 12-digit CCCD (optional)"
                  maxLength={12}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="description" 
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input placeholder="Brief description of your shop" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Address Information</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="City/Province"
                rules={[{ required: true, message: 'Please select city/province' }]}
              >
                <Select
                  placeholder="Select city/province"
                  onChange={handleProvinceChange}
                  value={selectedProvince}
                  loading={loadingProvinces}
                  disabled={!isEditing}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={provinces.map(p => ({
                    value: p.code,
                    label: p.name
                  }))}
                />
              </Form.Item>
              <Form.Item name="city" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                label="District"
                rules={[{ required: true, message: 'Please select district' }]}
              >
                <Select
                  placeholder="Select district"
                  onChange={handleDistrictChange}
                  value={selectedDistrict}
                  loading={loadingDistricts}
                  disabled={!isEditing || !selectedProvince}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={districts.map(d => ({
                    value: d.code,
                    label: d.name
                  }))}
                />
              </Form.Item>
              <Form.Item name="district" hidden>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Ward/Commune"
                rules={[{ required: true, message: 'Please select ward/commune' }]}
              >
                <Select
                  placeholder="Select ward/commune"
                  onChange={handleWardChange}
                  value={selectedWard}
                  loading={loadingWards}
                  disabled={!isEditing || !selectedDistrict}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={wards.map(w => ({
                    value: w.code,
                    label: w.name
                  }))}
                />
              </Form.Item>
              <Form.Item name="commune" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="street" 
                label="Street Address"
                rules={[{ required: true, message: 'Please enter street address' }]}
              >
                <Input placeholder="Enter street address (e.g., 123 Main St)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}