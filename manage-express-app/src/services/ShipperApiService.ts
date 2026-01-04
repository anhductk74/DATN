import apiClient from '../lib/apiClient';

// Shipper DTOs based on backend DTOs
export interface ShipperRequestDto {
  userId: string;
  shippingCompanyId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  status: ShipperStatus;
  latitude?: number;
  longitude?: number;
  vehicleType: string;
  licensePlate: string;
  region: string;
}

export interface ShipperRegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  street: string;
  commune: string;
  district: string;
  city: string;
  shippingCompanyId: string;
  idCardNumber?: string;
  driverLicenseNumber?: string;
  vehicleType?: string;
  licensePlate?: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  operationalCommune: string;
  operationalDistrict: string;
  operationalCity: string;
  maxDeliveryRadius?: number;
}

export interface ShipperUpdateDto {
  status?: ShipperStatus;
  vehicleType?: string;
  licensePlate?: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  operationalCommune?: string;
  operationalDistrict?: string;
  operationalCity?: string;
  maxDeliveryRadius?: number;
}

export interface ShipperResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  status: ShipperStatus;
  currentLatitude?: number;
  currentLongitude?: number;
  vehicleType: string;
  licensePlate: string;
  operationalCommune: string;
  operationalDistrict: string;
  operationalCity: string;
  operationalRegionFull: string;
  maxDeliveryRadius?: number;
  idCardNumber?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;
  driverLicenseNumber?: string;
  driverLicenseImage?: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
  userId: string;
  username: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShipperListResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  status: ShipperStatus;
  vehicleType: string;
  licensePlate: string;
  operationalRegionFull: string;
}

export enum ShipperStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BUSY = 'BUSY',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}
export interface ShipperFilters {
  search?: string;
  status?: ShipperStatus;
  region?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
export const shipperApiService = {
  // Get all shippers
async getAllShippers(filters?: ShipperFilters): Promise<PaginatedResponse<ShipperResponseDto>> {
  const params = new URLSearchParams();

  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.region) params.append('region', filters.region);
  if (filters?.page !== undefined) params.append('page', filters.page.toString());
  if (filters?.size !== undefined) params.append('size', filters.size.toString());

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PaginatedResponse<ShipperResponseDto>>(
    `/api/logistics/shippers${query}`
  );

  return response.data;
},

  // Get shipper by ID
  async getShipperById(id: string): Promise<ShipperResponseDto> {
    const response = await apiClient.get<ShipperResponseDto>(`/api/managers/shippers/${id}`);
    return response.data;
  },

  // Register new shipper (creates User + Shipper) with multipart/form-data
  async registerShipper(
    registerData: ShipperRegisterDto, 
    files?: {
      idCardFrontImage?: File;
      idCardBackImage?: File;
      driverLicenseImage?: File;
    }
  ): Promise<ShipperResponseDto> {
    // Validate required fields
    const requiredFields = ['email', 'password', 'fullName', 'phoneNumber', 'street', 'commune', 'district', 'city', 'shippingCompanyId', 'operationalCommune', 'operationalDistrict', 'operationalCity'];
    for (const field of requiredFields) {
      if (!registerData[field as keyof ShipperRegisterDto]) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }
    
    // NEW API STRUCTURE: dataInfo (JSON) + dataImage (files)
    const formData = new FormData();
    
    // 1. Append dataInfo as JSON string
    const dataInfo = {
      email: registerData.email,
      password: registerData.password,
      fullName: registerData.fullName,
      phoneNumber: registerData.phoneNumber,
      gender: registerData.gender,
      dateOfBirth: registerData.dateOfBirth,
      street: registerData.street,
      commune: registerData.commune,
      district: registerData.district,
      city: registerData.city,
      shippingCompanyId: registerData.shippingCompanyId,
      idCardNumber: registerData.idCardNumber,
      driverLicenseNumber: registerData.driverLicenseNumber,
      vehicleType: registerData.vehicleType,
      licensePlate: registerData.licensePlate,
      vehicleBrand: registerData.vehicleBrand,
      vehicleColor: registerData.vehicleColor,
      operationalCommune: registerData.operationalCommune,
      operationalDistrict: registerData.operationalDistrict,
      operationalCity: registerData.operationalCity,
      maxDeliveryRadius: registerData.maxDeliveryRadius
    };
    
    console.log('dataInfo JSON:', dataInfo);
    formData.append('dataInfo', JSON.stringify(dataInfo));
    
    // 2. Append image files separately
    if (files?.idCardFrontImage) {
      console.log('Appending idCardFrontImage:', files.idCardFrontImage.name, files.idCardFrontImage.size, 'bytes');
      formData.append('idCardFrontImage', files.idCardFrontImage);
    }
    if (files?.idCardBackImage) {
      console.log('Appending idCardBackImage:', files.idCardBackImage.name, files.idCardBackImage.size, 'bytes');
      formData.append('idCardBackImage', files.idCardBackImage);
    }
    if (files?.driverLicenseImage) {
      console.log('Appending driverLicenseImage:', files.driverLicenseImage.name, files.driverLicenseImage.size, 'bytes');
      formData.append('driverLicenseImage', files.driverLicenseImage);
    }
    
    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    // No need to set Content-Type header - axios will handle it for FormData
    const response = await apiClient.post<ShipperResponseDto>('/api/managers/shippers/register', formData);
    return response.data;
  },

  // Create new shipper
  async createShipper(shipperData: ShipperRequestDto): Promise<ShipperResponseDto> {
    const response = await apiClient.post<ShipperResponseDto>('/api/logistics/shippers', shipperData);
    return response.data;
  },

  // Update shipper
  async updateShipper(id: string, shipperData: ShipperUpdateDto): Promise<ShipperResponseDto> {
    const response = await apiClient.put<ShipperResponseDto>(`/api/managers/shippers/${id}`, shipperData);
    return response.data;
  },

  // Delete shipper
  async deleteShipper(id: string): Promise<void> {
    await apiClient.delete(`/api/managers/shippers/${id}`);
  },

  // Get shippers by company
  async getShippersByCompany(companyId: string): Promise<ShipperResponseDto[]> {
    const response = await apiClient.get<ShipperResponseDto[]>(`/api/managers/shippers?companyId=${companyId}`);
    return response.data;
  },

  // Get shippers by region
  async getShippersByRegion(region: string): Promise<ShipperResponseDto[]> {
    const response = await apiClient.get<ShipperResponseDto[]>(`/api/managers/shippers?region=${region}`);
    return response.data;
  },

  // Get shippers by status
  async getShippersByStatus(status: ShipperStatus): Promise<ShipperResponseDto[]> {
    const response = await apiClient.get<ShipperResponseDto[]>(`/api/managers/shippers?status=${status}`);
    return response.data;
  },

  // Update shipper location
  async updateShipperLocation(id: string, latitude: number, longitude: number): Promise<void> {
    await apiClient.put(`/api/managers/shippers/${id}/location`, { latitude, longitude });
  },

  // Update shipper status
  async updateShipperStatus(id: string, status: ShipperStatus): Promise<void> {
    await apiClient.put(`/api/managers/shippers/${id}/status`, { status });
  },

  // Get shipper statistics
  async getShipperStatistics(): Promise<{
    total: number;
    active: number;
    busy: number;
    inactive: number;
    onLeave: number;
    suspended: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      active: number;
      busy: number;
      inactive: number;
      onLeave: number;
      suspended: number;
    }>('/api/managers/shippers/statistics');
    return response.data;
  },

  // Get shipper delivery statistics
  // Logic: Đơn hàng chỉ được tính thành công khi sub-shipment sequence 3 (giao hàng cuối) có status = DELIVERED
  // totalDeliveries: Tổng số shipment order mà shipper đã nhận
  // successfulDeliveries: Số shipment có sub-shipment sequence=3 với status=DELIVERED
  // failedDeliveries: Số shipment có sub-shipment sequence=3 với status=CANCELLED hoặc RETURNED
  // successRate: (successfulDeliveries / totalDeliveries) * 100
  async getShipperDeliveryStats(shipperId: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
  }> {
    const response = await apiClient.get<{
      totalDeliveries: number;
      successfulDeliveries: number;
      failedDeliveries: number;
      successRate: number;
    }>(`/api/managers/shippers/${shipperId}/delivery-statistics`);
    return response.data;
  },

  // Utility: Format status to Vietnamese
  formatStatus(status: ShipperStatus): string {
    const statusMap: Record<ShipperStatus, string> = {
      [ShipperStatus.ACTIVE]: 'Sẵn sàng',
      [ShipperStatus.BUSY]: 'Đang giao hàng',
      [ShipperStatus.INACTIVE]: 'Không hoạt động',
      [ShipperStatus.ON_LEAVE]: 'Nghỉ phép',
      [ShipperStatus.SUSPENDED]: 'Tạm ngưng',
    };
    return statusMap[status] || status;
  },

  // Utility: Get status color
  getStatusColor(status: ShipperStatus): string {
    const colorMap: Record<ShipperStatus, string> = {
      [ShipperStatus.ACTIVE]: 'green',
      [ShipperStatus.BUSY]: 'orange',
      [ShipperStatus.INACTIVE]: 'red',
      [ShipperStatus.ON_LEAVE]: 'blue',
      [ShipperStatus.SUSPENDED]: 'volcano',
    };
    return colorMap[status] || 'default';
  },
};

export default shipperApiService;
