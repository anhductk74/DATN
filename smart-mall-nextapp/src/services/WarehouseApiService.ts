import apiClient from '../lib/apiClient';

// Warehouse DTOs based on backend DTOs
export interface WarehouseRequestDto {
  shippingCompanyId: string;
  name: string;
  address: string;
  region: string;
  managerName: string;
  phone: string;
  status: WarehouseStatus;
  province: string;
  district: string;
  ward: string;
  capacity?: number; // Optional - nếu backend hỗ trợ

}

export interface WarehouseResponseDto {
  id: string;
  name: string;
  address: string;
  region: string;
  managerName: string;
  phone: string;
  status: WarehouseStatus;
  province: string;
  district: string;
  ward: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
  capacity?: number; // Optional - nếu backend hỗ trợ
  currentStock?: number; // Optional - nếu backend hỗ trợ
  createdAt?: string;
  updatedAt?: string;
}

// Inventory item inside warehouse
export interface WarehouseInventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
}

export interface WarehouseStatisticsResponse {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  full: number;
  temporarilyClosed: number;
  totalCapacity: number;
  totalCurrentStock: number;
}

export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  FULL = 'FULL',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED'
}

export const warehouseApiService = {
  // Get all warehouses - corresponds to @GetMapping
  async getAllWarehouses(): Promise<WarehouseResponseDto[]> {
    const response = await apiClient.get<WarehouseResponseDto[]>('/logistics/warehouses');
    return response.data;
  },

  // Get warehouse by ID - corresponds to @GetMapping("/{id}")
  async getWarehouseById(id: string): Promise<WarehouseResponseDto> {
    const response = await apiClient.get<WarehouseResponseDto>(`/logistics/warehouses/${id}`);
    return response.data;
  },

  // Get warehouses by company - corresponds to @GetMapping("/company/{companyId}")
  async getWarehousesByCompany(companyId: string): Promise<WarehouseResponseDto[]> {
    const response = await apiClient.get<WarehouseResponseDto[]>(`/logistics/warehouses/company/${companyId}`);
    return response.data;
  },

  // Create new warehouse - corresponds to @PostMapping
  async createWarehouse(warehouseData: WarehouseRequestDto): Promise<WarehouseResponseDto> {
    const response = await apiClient.post<WarehouseResponseDto>('/logistics/warehouses', warehouseData);
    return response.data;
  },

  // Update warehouse - corresponds to @PutMapping("/{id}")
  async updateWarehouse(id: string, warehouseData: WarehouseRequestDto): Promise<WarehouseResponseDto> {
    const response = await apiClient.put<WarehouseResponseDto>(`/logistics/warehouses/${id}`, warehouseData);
    return response.data;
  },

  // Delete warehouse - corresponds to @DeleteMapping("/{id}")
  async deleteWarehouse(id: string): Promise<void> {
    await apiClient.delete(`/logistics/warehouses/${id}`);
  },

  // Get warehouse statistics - Cần backend implement
  async getWarehouseStatistics(): Promise<WarehouseStatisticsResponse> {
    const response = await apiClient.get<WarehouseStatisticsResponse>('/logistics/warehouses/statistics');
    return response.data;
  },

  // Get warehouse inventory - GET /api/warehouses/inventory/{warehouseId}
  async getWarehouseInventory(warehouseId: string): Promise<WarehouseInventoryItem[]> {
    const response = await apiClient.get<WarehouseInventoryItem[]>(`/api/warehouses/inventory/${warehouseId}`);
    return response.data;
  },

  // Update warehouse status - PUT /logistics/warehouses/{id}/status?status=ACTIVE
  async updateWarehouseStatus(id: string, status: WarehouseStatus): Promise<WarehouseResponseDto> {
    const response = await apiClient.put<WarehouseResponseDto>(
      `/logistics/warehouses/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  // Utility: Format status to Vietnamese
  formatStatus(status: WarehouseStatus): string {
    const statusMap: Record<WarehouseStatus, string> = {
      [WarehouseStatus.ACTIVE]: 'Hoạt động',
      [WarehouseStatus.INACTIVE]: 'Không hoạt động',
      [WarehouseStatus.MAINTENANCE]: 'Bảo trì',
      [WarehouseStatus.FULL]: 'Đầy',
      [WarehouseStatus.TEMPORARILY_CLOSED]: 'Tạm đóng',
    };
    return statusMap[status] || status;
  },

  // Utility: Get status color
  getStatusColor(status: WarehouseStatus): string {
    const colorMap: Record<WarehouseStatus, string> = {
      [WarehouseStatus.ACTIVE]: 'green',
      [WarehouseStatus.INACTIVE]: 'red',
      [WarehouseStatus.MAINTENANCE]: 'orange',
      [WarehouseStatus.FULL]: 'volcano',
      [WarehouseStatus.TEMPORARILY_CLOSED]: 'blue',
    };
    return colorMap[status] || 'default';
  },
};
export default warehouseApiService;