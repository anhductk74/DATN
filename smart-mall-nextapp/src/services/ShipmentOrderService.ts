import apiClient from '../lib/apiClient';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  REGISTERED = 'REGISTERED',
  PICKING_UP = 'PICKING_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNING = 'RETURNING',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED'
}

export interface ShipmentOrderRequestDto {
  orderId: string;
  warehouseId: string;
  pickupAddress: string;
  deliveryAddress: string;
  codAmount: number;
  shippingFee: number;
  status: ShipmentStatus;
  estimatedDelivery: string; // ISO string format
  weight: number;
}

export interface ShipmentOrderResponseDto {
  id: string;
  orderCode?: string;
  shipperName: string;
  warehouseName: string;
  pickupAddress: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  codAmount: number;
  shippingFee: number;
  status: ShipmentStatus;
  estimatedDelivery: string; // ISO string format
  deliveredAt?: string; // ISO string format
  returnedAt?: string; // ISO string format
  trackingCode: string;
  weight: number;
  subShipments?: Array<Record<string, any>>; // List of sub-shipment data
}

export interface ShipmentOrderListDto {
  id: string;
  orderCode?: string;
  shipperName: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  codAmount: number;
  trackingCode: string;
}
export interface ShipmentFilters {
  search?: string;            // Từ khóa tìm kiếm theo orderCode, tên shipper,...
  status?: ShipmentStatus;    // Trạng thái đơn hàng
  shipperId?: string;         // Lọc theo shipper
  warehouseId?: string;       // Lọc theo kho
  page?: number;              // Trang hiện tại
  size?: number;              // Số phần tử mỗi trang
  startDate?: string;         // Ngày bắt đầu (ISO string)
  endDate?: string;           // Ngày kết thúc (ISO string)
}

//  Kiểu phản hồi của API phân trang
export interface PaginatedResponse<T> {
  data: T[];           // Danh sách item trong trang
  currentPage: number; // Trang hiện tại
  totalItems: number;  // Tổng số item trong toàn bộ kết quả
  totalPages: number;  // Tổng số trang
}

// Dashboard statistics interface
export interface DashboardStatistics {
  activeShippers: number;
  orders: ShipmentOrderResponseDto[];
  totalDeliveredOrders: number;
  totalCod: number;
}

export class ShipmentOrderService {
  private static readonly BASE_URL = '/logistics/shipment-orders';

  // Tạo mới shipment order
  static async createShipment(dto: ShipmentOrderRequestDto): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.post<ShipmentOrderResponseDto>(
      this.BASE_URL,
      dto
    );
    return response.data;
  }

  // Cập nhật trạng thái shipment
  static async updateStatus(
    id: string,
    status: ShipmentStatus
  ): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.put<ShipmentOrderResponseDto>(
      `${this.BASE_URL}/${id}/status`,
      null,
      {
        params: { status }
      }
    );
    return response.data;
  }

  // Lấy tất cả shipment orders
static async getAll(
  filters?: ShipmentFilters
): Promise<PaginatedResponse<ShipmentOrderResponseDto>> {
  const params = new URLSearchParams();

  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.shipperId) params.append('shipperId', filters.shipperId);
  if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);
  if (filters?.page !== undefined) params.append('page', filters.page.toString());
  if (filters?.size !== undefined) params.append('size', filters.size.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PaginatedResponse<ShipmentOrderResponseDto>>(
    `${this.BASE_URL}${query}`
  );

  return response.data;
}

  // Lấy shipment theo ID
  static async getById(id: string): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.get<ShipmentOrderResponseDto>(
      `${this.BASE_URL}/${id}`
    );
    return response.data;
  }

  // Xóa shipment order
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  // Lấy shipment orders theo trạng thái
static async getByStatus(status: ShipmentStatus): Promise<ShipmentOrderResponseDto[]> {
  const allShipments = await this.getAll();
  return allShipments.data.filter(shipment => shipment.status === status);
}


  // Lấy shipment orders theo shipper
  static async getByShipper(shipperId: string): Promise<ShipmentOrderResponseDto[]> {
    const response = await apiClient.get<ShipmentOrderResponseDto[]>(
      `${this.BASE_URL}/shipper/${shipperId}`
    );
    return response.data;
  }

  // Lấy tất cả đơn hàng của shipper
  static async getAllOrdersOfShipper(shipperId: string): Promise<ShipmentOrderResponseDto[]> {
    const response = await apiClient.get<ShipmentOrderResponseDto[]>(
      `${this.BASE_URL}/${shipperId}/orders`
    );
    return response.data;
  }

  // Lấy đơn hàng đã giao của shipper theo khoảng thời gian
  static async getDeliveredOrdersOfShipperByDate(
    shipperId: string,
    startDate: string, // Format: YYYY-MM-DD
    endDate: string    // Format: YYYY-MM-DD
  ): Promise<ShipmentOrderResponseDto[]> {
    const response = await apiClient.get<ShipmentOrderResponseDto[]>(
      `${this.BASE_URL}/${shipperId}/delivered-orders`,
      {
        params: {
          start: startDate,
          end: endDate
        }
      }
    );
    return response.data;
  }

  // Lấy shipment orders theo warehouse
  static async getByWarehouse(warehouseId: string): Promise<ShipmentOrderResponseDto[]> {
    const response = await apiClient.get<ShipmentOrderResponseDto[]>(
      `${this.BASE_URL}/warehouse/${warehouseId}`
    );
    return response.data;
  }

  // Theo dõi shipment bằng tracking code
  static async trackByCode(trackingCode: string): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.get<ShipmentOrderResponseDto>(
      `${this.BASE_URL}/track/${trackingCode}`
    );
    return response.data;
  }

  // Cập nhật thông tin giao hàng
  static async updateDeliveryInfo(
    id: string,
    deliveryInfo: {
      deliveredAt?: string;
      returnedAt?: string;
      pickupAddress?: string;
      deliveryAddress?: string;
    }
  ): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.put<ShipmentOrderResponseDto>(
      `${this.BASE_URL}/${id}/delivery-info`,
      deliveryInfo
    );
    return response.data;
  }

  // Lấy thống kê shipment theo trạng thái
static async getStatusStatistics(): Promise<Record<ShipmentStatus, number>> {
  const allShipments = await this.getAll();
  const stats: Record<ShipmentStatus, number> = {
    [ShipmentStatus.PENDING]: 0,
    [ShipmentStatus.REGISTERED]: 0,
    [ShipmentStatus.PICKING_UP]: 0,
    [ShipmentStatus.IN_TRANSIT]: 0,
    [ShipmentStatus.DELIVERED]: 0,
    [ShipmentStatus.RETURNING]: 0,
    [ShipmentStatus.RETURNED]: 0,
    [ShipmentStatus.CANCELLED]: 0,
  };

  allShipments.data.forEach(shipment => {
    stats[shipment.status]++;
  });

  return stats;
}

// Tính tổng thu nhận (COD) theo trạng thái
static async getCodStatistics(): Promise<{
  totalCod: number;
  deliveredCod: number;
  pendingCod: number;
}> {
  const allShipments = await this.getAll();
  const shipments = allShipments.data;

  const totalCod = shipments.reduce((sum, shipment) => sum + shipment.codAmount, 0);
  const deliveredCod = shipments
    .filter(shipment => shipment.status === ShipmentStatus.DELIVERED)
    .reduce((sum, shipment) => sum + shipment.codAmount, 0);
  const pendingCod = shipments
    .filter(shipment =>
      [ShipmentStatus.PENDING, ShipmentStatus.REGISTERED, ShipmentStatus.PICKING_UP, ShipmentStatus.IN_TRANSIT].includes(
        shipment.status
      )
    )
    .reduce((sum, shipment) => sum + shipment.codAmount, 0);

  return {
    totalCod,
    deliveredCod,
    pendingCod
  };
}

  // Helper: Format trạng thái để hiển thị
  static formatStatus(status: ShipmentStatus): string {
    const statusMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'Chờ xử lý',
      [ShipmentStatus.REGISTERED]: 'Đã đăng ký',
      [ShipmentStatus.PICKING_UP]: 'Đang lấy hàng',
      [ShipmentStatus.IN_TRANSIT]: 'Đang vận chuyển',
      [ShipmentStatus.DELIVERED]: 'Đã giao hàng',
      [ShipmentStatus.RETURNING]: 'Đang hoàn trả',
      [ShipmentStatus.RETURNED]: 'Đã hoàn trả',
      [ShipmentStatus.CANCELLED]: 'Đã hủy',
    };
    return statusMap[status] || status;
  }

  // Helper: Kiểm tra trạng thái có thể cập nhật không
  static canUpdateStatus(currentStatus: ShipmentStatus, newStatus: ShipmentStatus): boolean {
    const allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      [ShipmentStatus.PENDING]: [ShipmentStatus.REGISTERED, ShipmentStatus.PICKING_UP, ShipmentStatus.CANCELLED],
      [ShipmentStatus.REGISTERED]: [ShipmentStatus.PICKING_UP, ShipmentStatus.CANCELLED],
      [ShipmentStatus.PICKING_UP]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED],
      [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNING],
      [ShipmentStatus.DELIVERED]: [ShipmentStatus.RETURNING],
      [ShipmentStatus.RETURNING]: [ShipmentStatus.RETURNED],
      [ShipmentStatus.RETURNED]: [],
      [ShipmentStatus.CANCELLED]: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }
    // -------------------- Assign Shipper --------------------
  static async assignShipper(
    shipmentOrderId: string,
    shipperId: string
  ): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.put<ShipmentOrderResponseDto>(
      `${this.BASE_URL}/${shipmentOrderId}/assign-shipper`,
      null,
      { params: { shipperId } }
    );
    return response.data;
  }

  // -------------------- Unassign Shipper --------------------
  static async unassignShipper(
    shipmentOrderId: string
  ): Promise<ShipmentOrderResponseDto> {
    const response = await apiClient.put<ShipmentOrderResponseDto>(
      `${this.BASE_URL}/${shipmentOrderId}/unassign-shipper`
    );
    return response.data;
  }

  // -------------------- Check if order has shipment --------------------
  static async checkOrderHasShipment(orderId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(
        `${this.BASE_URL}/order/${orderId}/exists`
      );
      return response.data;
    } catch (error) {
      // Silently return false if check fails (order might not have shipment yet)
      return false;
    }
  }

  // -------------------- Get shipment by order ID --------------------
  static async getByOrderId(orderId: string): Promise<ShipmentOrderResponseDto | null> {
    try {
      const response = await apiClient.get<ShipmentOrderResponseDto>(
        `${this.BASE_URL}/order/${orderId}`
      );
      return response.data;
    } catch (error: any) {
      // Handle 404 (not found) or 500 (internal server error) gracefully
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log(`⚠️ No shipment found for order ${orderId} (Status: ${error.response?.status})`);
        return null;
      }
      throw error;
    }
  }

  // -------------------- Get dashboard statistics --------------------
  static async getDashboardStatistics(
    startDate: string,
    endDate: string
  ): Promise<DashboardStatistics> {
    try {
      const response = await apiClient.get<DashboardStatistics>(
        `${this.BASE_URL}/dashboard`,
        {
          params: {
            start: startDate,
            end: endDate
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      // Return default values if API fails
      return {
        activeShippers: 0,
        orders: [],
        totalDeliveredOrders: 0,
        totalCod: 0
      };
    }
  }
}

export default ShipmentOrderService;

