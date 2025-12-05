import apiClient from '../lib/apiClient';
import { ShipmentStatus } from './ShipmentOrderService';

export interface SubShipmentOrderRequestDto {
  shipmentOrderId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  shipperId: string;
  status: ShipmentStatus;
  sequence: number;
  startTime?: string; // ISO string format
  endTime?: string; // ISO string format
}

export interface SubShipmentOrderUpdateDto {
  status?: ShipmentStatus;
  startTime?: string; // ISO string format
  endTime?: string; // ISO string format
}

export interface SubShipmentOrderResponseDto {
  id: string;
  shipmentOrderId: string;
  shipmentOrderCode: string;
  
  fromWarehouseId: string;
  fromWarehouseName: string;
  
  toWarehouseId: string;
  toWarehouseName: string;
  
  shipperId: string;
  shipperName: string;
  
  status: ShipmentStatus;
  sequence: number;
  startTime?: string; // ISO string format
  endTime?: string; // ISO string format
}

class SubShipmentOrderService {
  private baseURL = '/logistics/sub-shipment-orders';

  /**
   * Get all sub-shipment orders
   */
  async getAll(): Promise<SubShipmentOrderResponseDto[]> {
    const response = await apiClient.get<SubShipmentOrderResponseDto[]>(this.baseURL);
    return response.data;
  }

  /**
   * Get sub-shipment order by ID
   */
  async getById(id: string): Promise<SubShipmentOrderResponseDto> {
    const response = await apiClient.get<SubShipmentOrderResponseDto>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Get all sub-shipment orders by shipment order ID
   */
  async getByShipmentOrder(shipmentOrderId: string): Promise<SubShipmentOrderResponseDto[]> {
    const response = await apiClient.get<SubShipmentOrderResponseDto[]>(
      `${this.baseURL}/shipment/${shipmentOrderId}`
    );
    return response.data;
  }

  /**
   * Create a new sub-shipment order
   */
  async create(dto: SubShipmentOrderRequestDto): Promise<SubShipmentOrderResponseDto> {
    const response = await apiClient.post<SubShipmentOrderResponseDto>(this.baseURL, dto);
    return response.data;
  }

  /**
   * Update an existing sub-shipment order
   * Uses SubShipmentOrderUpdateDto with only status, startTime, and endTime
   */
  async update(id: string, dto: SubShipmentOrderUpdateDto): Promise<SubShipmentOrderResponseDto> {
    const response = await apiClient.put<SubShipmentOrderResponseDto>(`${this.baseURL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete a sub-shipment order
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Helper: Format status to Vietnamese
   */
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
}

export const subShipmentOrderService = new SubShipmentOrderService();
export default SubShipmentOrderService;
