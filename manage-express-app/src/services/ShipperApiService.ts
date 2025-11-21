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

export interface ShipperResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  status: ShipperStatus;
  latitude?: number;
  longitude?: number;
  vehicleType: string;
  licensePlate: string;
  region: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
  userId: string;
  username: string;
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
  region: string;
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
    const response = await apiClient.get<ShipperResponseDto>(`/api/logistics/shippers/${id}`);
    return response.data;
  },

  // Create new shipper
  async createShipper(shipperData: ShipperRequestDto): Promise<ShipperResponseDto> {
    const response = await apiClient.post<ShipperResponseDto>('/api/logistics/shippers', shipperData);
    return response.data;
  },

  // Update shipper
  async updateShipper(id: string, shipperData: ShipperRequestDto): Promise<ShipperResponseDto> {
    const response = await apiClient.put<ShipperResponseDto>(`/api/logistics/shippers/${id}`, shipperData);
    return response.data;
  },

  // Delete shipper
  async deleteShipper(id: string): Promise<void> {
    await apiClient.delete(`/api/logistics/shippers/${id}`);
  },

  // Get shippers by company
  async getShippersByCompany(companyId: string): Promise<ShipperResponseDto[]> {
    const response = await apiClient.get<ShipperResponseDto[]>(`/api/logistics/shippers/company/${companyId}`);
    return response.data;
  },

  // Get shippers by region
  async getShippersByRegion(region: string): Promise<ShipperResponseDto[]> {
    const response = await apiClient.get<ShipperResponseDto[]>(`/api/logistics/shippers/region/${region}`);
    return response.data;
  },

  // Get shippers by status
  async getShippersByStatus(status: ShipperStatus): Promise<ShipperResponseDto[]> {
    const response = await apiClient.get<ShipperResponseDto[]>(`/api/logistics/shippers/status/${status}`);
    return response.data;
  },

  // Update shipper location
  async updateShipperLocation(id: string, latitude: number, longitude: number): Promise<void> {
    await apiClient.put(`/api/logistics/shippers/${id}/location`, { latitude, longitude });
  },

  // Update shipper status
  async updateShipperStatus(id: string, status: ShipperStatus): Promise<void> {
    await apiClient.put(`/api/logistics/shippers/${id}/status`, { status });
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
    }>('/api/logistics/shippers/statistics');
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
    }>(`/api/logistics/shippers/${shipperId}/delivery-statistics`);
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