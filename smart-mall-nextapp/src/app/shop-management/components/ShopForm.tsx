"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import { Select } from "antd";
import {getCloudinaryUrl} from "@/config/config";
import { locationService } from "@/services/LocationService";
import { 
  ShopOutlined,
  CameraOutlined,
  SaveOutlined,
  LoadingOutlined 
} from "@ant-design/icons";
import { Shop, CreateShopData, UpdateShopData, ShopAddress } from "@/services";

const { Option } = Select;

// Location interfaces
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

interface ShopFormProps {
  shop?: Shop | null;
  onSubmit: (data: CreateShopData | UpdateShopData, imageFile?: File) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

interface FormData {
  name: string;
  description: string;
  phoneNumber: string;
  address: ShopAddress;
}

// Validation schema
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Shop name is required")
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name must not exceed 100 characters")
    .trim(),
  description: yup
    .string()
    .default("")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^[0-9+\-\s()]+$/,
      "Please enter a valid phone number"
    )
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters"),
  address: yup.object().shape({
    street: yup.string().default("").max(200, "Street address must not exceed 200 characters").trim(),
    commune: yup.string().default("").max(100, "Commune/Ward must not exceed 100 characters").trim(),
    district: yup.string().default("").max(100, "District must not exceed 100 characters").trim(),
    city: yup.string().default("").max(100, "City must not exceed 100 characters").trim(),
  }),
});

export default function ShopForm({ shop, onSubmit, onCancel, submitting = false }: ShopFormProps) {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    getValues
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: shop?.name || "",
      description: shop?.description || "",
      phoneNumber: shop?.numberPhone || "",
      address: shop?.address || {
        street: "",
        commune: "",
        district: "",
        city: ""
      }
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  
  // Location state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    loadProvinces();
  }, []);

  // Update form and image when shop prop changes
  useEffect(() => {
    if (shop) {
      // Reset form with new shop data
      reset({
        name: shop.name || "",
        description: shop.description || "",
        phoneNumber: shop.numberPhone || "",
        address: shop.address || {
          street: "",
          commune: "",
          district: "",
          city: ""
        }
      });
      
      // Update image preview
      if (shop.avatar) {
        setImagePreview(getCloudinaryUrl(shop.avatar));
      } else {
        setImagePreview("");
      }

      // Load location data for existing shop
      if (shop.address) {
        loadLocationDataForShop(shop.address);
      }
    } else {
      // Reset form for new shop creation
      reset({
        name: "",
        description: "",
        phoneNumber: "",
        address: {
          street: "",
          commune: "",
          district: "",
          city: ""
        }
      });
      setImagePreview("");
      resetLocationData();
    }
    
    // Reset image file when shop changes
    setImageFile(null);
  }, [shop, reset]);

  // Location functions
  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
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
      console.error('Failed to load districts:', error);
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
      console.error('Failed to load wards:', error);
    } finally {
      setLoadingWards(false);
    }
  };

  const resetLocationData = () => {
    setSelectedProvinceCode("");
    setSelectedDistrictCode("");
    setDistricts([]);
    setWards([]);
  };

  const loadLocationDataForShop = async (address: ShopAddress) => {
    try {
      // Find province by name
      const foundProvince = provinces.find(p => p.name === address.city);
      if (foundProvince) {
        setSelectedProvinceCode(foundProvince.code);
        await loadDistricts(foundProvince.code);
        
        // Find district by name after districts are loaded
        setTimeout(async () => {
          const foundDistrict = districts.find(d => d.name === address.district);
          if (foundDistrict) {
            setSelectedDistrictCode(foundDistrict.code);
            await loadWards(foundDistrict.code);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading location data for shop:', error);
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvinceCode(provinceCode);
    setSelectedDistrictCode("");
    
    const province = provinces.find(p => p.code === provinceCode);
    if (province) {
      setValue('address.city', province.name);
      setValue('address.district', '');
      setValue('address.commune', '');
      loadDistricts(provinceCode);
    }
    
    setWards([]);
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrictCode(districtCode);
    
    const district = districts.find(d => d.code === districtCode);
    if (district) {
      setValue('address.district', district.name);
      setValue('address.commune', '');
      loadWards(districtCode);
    }
  };

  const handleWardChange = (wardCode: string) => {
    const ward = wards.find(w => w.code === wardCode);
    if (ward) {
      setValue('address.commune', ward.name);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB!");
      return;
    }

    setImageFile(file);
    setImageLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageLoading(false);
    };
    reader.onerror = () => {
      alert("Failed to load image!");
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Form submit handler
  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data, imageFile || undefined);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Handle cancel - reset form and image
  const handleCancel = () => {
    reset();
    setImageFile(null);
    setImagePreview(shop?.avatar ? getCloudinaryUrl(shop.avatar) : "");
    onCancel();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {shop ? "Edit Your Shop" : "Create Your Shop"}
            </h2>
            <p className="text-blue-100">
              {shop ? "Update your shop information" : "Set up your shop to start selling"}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 text-3xl font-light transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your shop name"
                    maxLength={100}
                  />
                )}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none text-gray-900 ${
                      errors.description 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Tell customers about your shop..."
                    maxLength={500}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${
                      errors.phoneNumber 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter phone number (e.g., +84 123 456 789)"
                    maxLength={20}
                  />
                )}
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          {/* Right Column - Image & Address */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Shop Avatar
              </label>
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-lg">
                  {imageLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <LoadingOutlined className="text-3xl text-blue-500 animate-spin mb-2" />
                      <span className="text-xs text-gray-500">Loading...</span>
                    </div>
                  ) : imagePreview ? (
                    <Image 
                      src={imagePreview} 
                      alt="Shop avatar preview"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.error("Failed to load image:", imagePreview);
                        setImagePreview("");
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <ShopOutlined className="text-4xl text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                  {!imageLoading && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                      <CameraOutlined className="text-white text-3xl" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <div className="flex gap-3">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    {imagePreview ? "Change Image" : "Choose Image"}
                  </label>
                  {(imagePreview || imageFile) && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        // Reset file input
                        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Address Information
              </label>
              <div className="space-y-3">
                {/* Street Address */}
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${
                          errors.address?.street 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Street address"
                        maxLength={200}
                      />
                      {errors.address?.street && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                      )}
                    </div>
                  )}
                />

                {/* Province/City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province/City <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder={loadingProvinces ? "Loading..." : "Select province/city"}
                    loading={loadingProvinces}
                    disabled={!mounted || loadingProvinces}
                    value={selectedProvinceCode || undefined}
                    onChange={handleProvinceChange}
                    className="w-full"
                    size="large"
                    style={{ height: '48px' }}
                    notFoundContent={loadingProvinces ? "Loading..." : "No data"}
                  >
                    {provinces.map(province => (
                      <Option key={province.code} value={province.code}>
                        {province.name}
                      </Option>
                    ))}
                  </Select>
                  {errors.address?.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                  )}
                </div>

                {/* District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District <span className="text-red-500">*</span>
                    </label>
                    <Select
                      placeholder="Select district"
                      loading={loadingDistricts}
                      disabled={!selectedProvinceCode}
                      value={selectedDistrictCode || undefined}
                      onChange={handleDistrictChange}
                      className="w-full"
                      size="large"
                      style={{ height: '48px' }}
                    >
                      {districts.map(district => (
                        <Option key={district.code} value={district.code}>
                          {district.name}
                        </Option>
                      ))}
                    </Select>
                    {errors.address?.district && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.district.message}</p>
                    )}
                  </div>

                  {/* Ward/Commune */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ward/Commune <span className="text-red-500">*</span>
                    </label>
                    <Select
                      placeholder="Select ward/commune"
                      loading={loadingWards}
                      disabled={!selectedDistrictCode}
                      onChange={handleWardChange}
                      className="w-full"
                      size="large"
                      style={{ height: '48px' }}
                    >
                      {wards.map(ward => (
                        <Option key={ward.code} value={ward.code}>
                          {ward.name}
                        </Option>
                      ))}
                    </Select>
                    {errors.address?.commune && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.commune.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Status */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-600 space-y-1">
              {errors.name && <li>• {errors.name.message}</li>}
              {errors.description && <li>• {errors.description.message}</li>}
              {errors.phoneNumber && <li>• {errors.phoneNumber.message}</li>}
              {errors.address?.street && <li>• Street: {errors.address.street.message}</li>}
              {errors.address?.commune && <li>• Commune: {errors.address.commune.message}</li>}
              {errors.address?.district && <li>• District: {errors.address.district.message}</li>}
              {errors.address?.city && <li>• City: {errors.address.city.message}</li>}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && !isValid && (
              <span className="text-red-600">⚠ Please complete required fields</span>
            )}
            {isDirty && isValid && (
              <span className="text-green-600">✓ Form is ready to submit</span>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleCancel}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onFormSubmit)}
              disabled={submitting || !isValid}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-300 font-semibold ${
                submitting || !isValid
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {submitting ? (
                <LoadingOutlined className="animate-spin" />
              ) : (
                <SaveOutlined />
              )}
              <span>{shop ? "Update Shop" : "Create Shop"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}