"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Upload, Card, Select, App } from "antd";
import { UploadOutlined, ShopOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import Image from "next/image";
import { getCloudinaryUrl } from "@/config/config";
import { locationService } from "@/services/LocationService";
import { CreateShopData, ShopAddress } from "@/services";

const { TextArea } = Input;
const { Option } = Select;

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface CreateShopBasicProps {
  onSubmit: (data: CreateShopData, imageFile?: File) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export default function CreateShopBasic({ onSubmit, onCancel, submitting = false }: CreateShopBasicProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  // Location state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
      message.error('Failed to load provinces');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({ district: undefined, commune: undefined });
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error('Failed to load districts:', error);
      message.error('Failed to load districts');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode: string) => {
    setLoadingWards(true);
    setWards([]);
    form.setFieldsValue({ commune: undefined });
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Failed to load wards:', error);
      message.error('Failed to load wards');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code === value);
    if (province) {
      form.setFieldValue('city', province.name);
      loadDistricts(value);
    }
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.code === value);
    if (district) {
      form.setFieldValue('districtName', district.name);
      loadWards(value);
    }
  };

  const handleWardChange = (value: string) => {
    const ward = wards.find(w => w.code === value);
    if (ward) {
      form.setFieldValue('communeName', ward.name);
    }
  };

  const handleImageChange = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error("Please select an image file!");
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("File size must be less than 5MB!");
      return false;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      message.error("Failed to load image!");
    };
    reader.readAsDataURL(file);
    
    return false; // Prevent auto upload
  };

  const handleSubmit = async (values: any) => {
    try {
      const shopData: CreateShopData = {
        name: values.name,
        description: values.description || "",
        phoneNumber: values.phoneNumber,
        cccd: values.cccd,
        ownerId: "", // Will be set in parent component
        address: {
          street: values.street || "",
          commune: values.communeName || "",
          district: values.districtName || "",
          city: values.city || "",
        },
      };

      await onSubmit(shopData, imageFile || undefined);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <ShopOutlined className="text-2xl" />
          <span>Create Your Shop</span>
        </div>
      }
      bordered={false}
      className="shadow-lg"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <Form.Item
              label="Shop Name"
              name="name"
              rules={[
                { required: true, message: 'Please input shop name!' },
                { min: 2, message: 'Shop name must be at least 2 characters' },
                { max: 100, message: 'Shop name must not exceed 100 characters' }
              ]}
            >
              <Input placeholder="Enter shop name" size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { max: 500, message: 'Description must not exceed 500 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Tell customers about your shop..." 
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Please input phone number!' },
                { pattern: /^[0-9]{10}$/, message: 'Phone number must be 10 digits' }
              ]}
            >
              <Input 
                placeholder="Enter phone number (10 digits)" 
                size="large"
                maxLength={10}
              />
            </Form.Item>

            <Form.Item
              label="CCCD"
              name="cccd"
              rules={[
                { pattern: /^[0-9]{12}$/, message: 'CCCD must be 12 digits' }
              ]}
            >
              <Input 
                placeholder="Enter CCCD (12 digits)" 
                size="large"
                maxLength={12}
              />
            </Form.Item>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Form.Item label="Shop Avatar">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {imagePreview ? (
                    <Image 
                      src={imagePreview} 
                      alt="Shop avatar preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShopOutlined className="text-4xl text-gray-400" />
                  )}
                </div>
                <Upload
                  beforeUpload={handleImageChange}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                </Upload>
              </div>
            </Form.Item>

            <Form.Item
              label="Street Address"
              name="street"
            >
              <Input placeholder="Enter street address" size="large" />
            </Form.Item>

            <Form.Item
              label="Province/City"
              name="province"
              rules={[{ required: true, message: 'Please select province!' }]}
            >
              <Select
                placeholder="Select province/city"
                loading={loadingProvinces}
                onChange={handleProvinceChange}
                size="large"
                showSearch
              >
                {provinces.map(province => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="District"
              name="district"
              rules={[{ required: true, message: 'Please select district!' }]}
            >
              <Select
                placeholder="Select district"
                loading={loadingDistricts}
                disabled={districts.length === 0}
                onChange={handleDistrictChange}
                size="large"
                showSearch
              >
                {districts.map(district => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ward/Commune"
              name="commune"
              rules={[{ required: true, message: 'Please select ward/commune!' }]}
            >
              <Select
                placeholder="Select ward/commune"
                loading={loadingWards}
                disabled={wards.length === 0}
                onChange={handleWardChange}
                size="large"
                showSearch
              >
                {wards.map(ward => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Hidden fields for storing names */}
            <Form.Item name="city" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="districtName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="communeName" hidden>
              <Input />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button onClick={onCancel} size="large">
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitting}
            size="large"
            icon={submitting ? <LoadingOutlined /> : <ShopOutlined />}
          >
            Create Shop
          </Button>
        </div>
      </Form>
    </Card>
  );
}
