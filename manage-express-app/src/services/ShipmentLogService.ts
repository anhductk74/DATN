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

export interface ShipmentLogRequestDto {
  shipmentOrderId: string;
  subShipmentOrderId?: string; // Optional - chỉ gửi khi tạo log cho sub-shipment
  status: ShipmentStatus;
  location: string;
  note: string;
}

export interface ShipmentLogResponseDto {
  id: string;
  shipmentOrderId: string;
  subShipmentOrderId?: string; // Optional - chỉ có khi log thuộc về sub-shipment
  status: ShipmentStatus;
  location: string;
  note: string;
  createdAt: string; // ISO string format
  message: string;
  timestamp: string; // ISO string format
}

export class ShipmentLogService {
  private static readonly BASE_URL = '/api/logistics/shipment-logs';

  // Lấy tất cả logs
  static async getAllLogs(): Promise<ShipmentLogResponseDto[]> {
    const response = await apiClient.get<ShipmentLogResponseDto[]>(this.BASE_URL);
    return response.data;
  }

  // Lấy log theo ID
  static async getLogById(id: string): Promise<ShipmentLogResponseDto> {
    const response = await apiClient.get<ShipmentLogResponseDto>(
      `${this.BASE_URL}/${id}`
    );
    return response.data;
  }

  // Lấy logs theo shipment order ID
  static async getLogsByShipmentOrder(shipmentOrderId: string): Promise<ShipmentLogResponseDto[]> {
    const response = await apiClient.get<ShipmentLogResponseDto[]>(
      `${this.BASE_URL}/order/${shipmentOrderId}`
    );
    return response.data;
  }

  // Tạo log mới
  static async createLog(dto: ShipmentLogRequestDto): Promise<ShipmentLogResponseDto> {
    const response = await apiClient.post<ShipmentLogResponseDto>(
      this.BASE_URL,
      dto
    );
    return response.data;
  }

  // Xóa log
  static async deleteLog(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  // Lấy logs theo trạng thái
  static async getLogsByStatus(status: ShipmentStatus): Promise<ShipmentLogResponseDto[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.filter(log => log.status === status);
  }

  // Lấy logs trong khoảng thời gian
  static async getLogsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ShipmentLogResponseDto[]> {
    const response = await apiClient.get<ShipmentLogResponseDto[]>(
      `${this.BASE_URL}/date-range`,
      {
        params: { startDate, endDate }
      }
    );
    return response.data;
  }

  // Lấy logs theo location
  static async getLogsByLocation(location: string): Promise<ShipmentLogResponseDto[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.filter(log => 
      log.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Tạo log theo dõi tự động khi cập nhật trạng thái shipment
  static async createTrackingLog(
    shipmentOrderId: string,
    status: ShipmentStatus,
    location?: string,
    note?: string
  ): Promise<ShipmentLogResponseDto> {
    const logData: ShipmentLogRequestDto = {
      shipmentOrderId,
      status,
      location: location || '',
      note: note || this.getDefaultStatusMessage(status)
    };

    return this.createLog(logData);
  }

  // Lấy lịch sử theo dõi đầy đủ của một shipment order
  static async getTrackingHistory(shipmentOrderId: string): Promise<ShipmentLogResponseDto[]> {
    const logs = await this.getLogsByShipmentOrder(shipmentOrderId);
    // Sắp xếp theo thời gian tạo (mới nhất trước)
    return logs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Lấy log gần nhất của một shipment order
  static async getLatestLog(shipmentOrderId: string): Promise<ShipmentLogResponseDto | null> {
    const logs = await this.getTrackingHistory(shipmentOrderId);
    return logs.length > 0 ? logs[0] : null;
  }

  // Thống kê logs theo trạng thái
  static async getLogStatistics(): Promise<Record<ShipmentStatus, number>> {
    const allLogs = await this.getAllLogs();
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

    allLogs.forEach(log => {
      stats[log.status]++;
    });

    return stats;
  }

  // Helper: Lấy thông điệp mặc định cho trạng thái
  private static getDefaultStatusMessage(status: ShipmentStatus): string {
    const messages: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'Đơn hàng đang chờ xử lý',
      [ShipmentStatus.REGISTERED]: 'Đã đăng ký vận đơn',
      [ShipmentStatus.PICKING_UP]: 'Shipper đang đến lấy hàng',
      [ShipmentStatus.IN_TRANSIT]: 'Đơn hàng đang được vận chuyển',
      [ShipmentStatus.DELIVERED]: 'Đơn hàng đã được giao thành công',
      [ShipmentStatus.RETURNING]: 'Đơn hàng đang được hoàn trả',
      [ShipmentStatus.RETURNED]: 'Đơn hàng đã hoàn trả về kho',
      [ShipmentStatus.CANCELLED]: 'Đơn hàng đã bị hủy',
    };
    return messages[status] || 'Cập nhật trạng thái đơn hàng';
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

  // Helper: Format thời gian hiển thị
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Xuất logs ra Excel
  static async exportLogsToExcel(
    shipmentOrderId?: string,
    dateRange?: [string, string]
  ): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (shipmentOrderId) params.append('shipmentOrderId', shipmentOrderId);
    if (dateRange) {
      params.append('startDate', dateRange[0]);
      params.append('endDate', dateRange[1]);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}/export?${queryString}` : `${this.BASE_URL}/export`;
    
    const response = await apiClient.get(url, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default ShipmentLogService;