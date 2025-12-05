import apiClient from '../lib/apiClient';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PICKING_UP = 'PICKING_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNING = 'RETURNING',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED'
}

export interface GhtkOrderRequest {
  id: string;
  pick_name: string;
  pick_address: string;
  pick_province: string;
  pick_district: string;
  pick_ward: string;
  pick_tel: string;
  name: string; // Tên người nhận
  tel: string; // SĐT người nhận
  address: string; // Địa chỉ người nhận
  province: string;
  district: string;
  ward: string;
  hamlet?: string;
  is_freeship: string; // "1" hoặc "0"
  pick_money: number; // COD amount
  value: number; // Giá trị đơn hàng
  note?: string;
  transport?: string; // "road" | "fly"
  pick_option?: string; // "cod" | "post"
  weight_option?: string; // "kg" | "gram"
  total_weight?: number;
}

export interface GhtkProduct {
  name: string;
  weight: number; // kg
  quantity: number;
  product_code?: string;
}

export interface GhtkOrderResponse {
  label: string; // tracking code
  partner_id: string;
  status: string;
  status_text: string;
  created?: string;
  modified?: string;
  message?: string;
  pick_money: number;
  total_fee: number;
}

export interface GhtkOrderStatus {
  label: string;
  status: string;
  status_text: string;
  created: string;
  modified: string;
  message: string;
  pick_money: number;
  total_fee: number;
  description: string;
}

export interface GhtkFeeRequest {
  pick_address: string;
  address: string; // Địa chỉ giao hàng
  weight: number;
  value?: number;
  transport?: string;
}

export interface GhtkFeeResponse {
  fee: number;
  insurance_fee: number;
  include_vat: number;
  cost_id: string;
  delivery_type: string;
  a: number;
  dt: number;
  extFees: any[];
}

export class GhtkService {
  private static readonly BASE_URL = '/ghtk'; // Proxy qua backend của bạn
  
  // 1️⃣ Tạo đơn hàng GHTK với dữ liệu thủ công
  static async registerOrder(
    orderData: GhtkOrderRequest,
    products: GhtkProduct[]
  ): Promise<GhtkOrderResponse> {
    const response = await apiClient.post<{
      success: boolean;
      order: GhtkOrderResponse;
      message?: string;
    }>(`${this.BASE_URL}/register-order`, {
      order: orderData,
      products: products
    });

    if (response.data.success && response.data.order) {
      return response.data.order;
    } else {
      throw new Error(`Không thể tạo đơn GHTK: ${response.data.message || 'Lỗi không xác định'}`);
    }
  }

  // 2️⃣ Tạo đơn hàng GHTK từ ShipmentOrder entity
  static async registerOrderFromShipment(shipmentOrderId: string): Promise<GhtkOrderResponse> {
    try {
      const response = await apiClient.post<any>(`${this.BASE_URL}/register/${shipmentOrderId}`);
      
      // Backend trả về trực tiếp object GHTK response
      const data = response.data;
      
      // Kiểm tra nếu có label (thành công)
      if (data && data.label) {
        return {
          label: data.label,
          partner_id: data.partner_id || '',
          status: data.status_id?.toString() || '',
          status_text: data.status_text || '',
          pick_money: data.pick_money || 0,
          total_fee: data.fee || 0,
          message: 'Đăng ký GHTK thành công'
        };
      }
      
      // Nếu có cấu trúc wrapped
      if (data.success && data.order) {
        return data.order;
      }
      
      throw new Error(data.message || 'Không thể tạo đơn GHTK');
    } catch (error: any) {
      console.error('GHTK registration error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể đăng ký GHTK'
      );
    }
  }

  // 3️⃣ Lấy và cập nhật trạng thái đơn hàng
  static async fetchAndUpdateOrderStatus(trackingCode: string): Promise<ShipmentStatus> {
    const response = await apiClient.get<{
      success: boolean;
      order: GhtkOrderStatus;
      status: ShipmentStatus;
      message?: string;
    }>(`${this.BASE_URL}/status/${trackingCode}`);

    if (response.data.success) {
      return response.data.status;
    } else {
      throw new Error(`Không thể lấy trạng thái từ GHTK: ${response.data.message || ''}`);
    }
  }

  // 4️⃣ Hủy đơn hàng
  static async cancelOrder(trackingCode: string): Promise<void> {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
    }>(`${this.BASE_URL}/cancel/${trackingCode}`);

    if (!response.data.success) {
      throw new Error(`Không thể hủy đơn GHTK: ${response.data.message || 'Lỗi không xác định'}`);
    }
  }

  // 5️⃣ In nhãn vận đơn
  static async printLabel(trackingCode: string): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/print/${trackingCode}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // 6️⃣ Tính phí vận chuyển
  static async calculateShippingFee(feeRequest: GhtkFeeRequest): Promise<GhtkFeeResponse> {
    const response = await apiClient.post<{
      success: boolean;
      fee: GhtkFeeResponse;
      message?: string;
    }>(`${this.BASE_URL}/calculate-fee`, feeRequest);

    if (response.data.success && response.data.fee) {
      return response.data.fee;
    } else {
      throw new Error(`Không thể tính phí GHTK: ${response.data.message || 'Lỗi không xác định'}`);
    }
  }

  // 7️⃣ Lấy thông tin chi tiết đơn hàng
  static async getOrderDetails(trackingCode: string): Promise<GhtkOrderStatus> {
    const response = await apiClient.get<{
      success: boolean;
      order: GhtkOrderStatus;
      message?: string;
    }>(`${this.BASE_URL}/order-details/${trackingCode}`);

    if (response.data.success && response.data.order) {
      return response.data.order;
    } else {
      throw new Error(`Không thể lấy thông tin đơn hàng: ${response.data.message || 'Lỗi không xác định'}`);
    }
  }

  // 8️⃣ Lấy danh sách địa chỉ (tỉnh/thành)
  static async getProvinces(): Promise<Array<{ name: string; code: string }>> {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{ name: string; code: string }>;
    }>(`${this.BASE_URL}/provinces`);

    return response.data.data || [];
  }

  // 9️⃣ Lấy danh sách quận/huyện
  static async getDistricts(provinceCode: string): Promise<Array<{ name: string; code: string }>> {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{ name: string; code: string }>;
    }>(`${this.BASE_URL}/districts/${provinceCode}`);

    return response.data.data || [];
  }

  // 🔟 Lấy danh sách phường/xã
  static async getWards(districtCode: string): Promise<Array<{ name: string; code: string }>> {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{ name: string; code: string }>;
    }>(`${this.BASE_URL}/wards/${districtCode}`);

    return response.data.data || [];
  }

  // 📊 Thống kê đơn hàng GHTK
  static async getOrderStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalFee: number;
    totalCod: number;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<{
      success: boolean;
      statistics: {
        totalOrders: number;
        deliveredOrders: number;
        pendingOrders: number;
        cancelledOrders: number;
        totalFee: number;
        totalCod: number;
      };
    }>(`${this.BASE_URL}/statistics?${params.toString()}`);

    return response.data.statistics;
  }

  // 🔄 Đồng bộ trạng thái tất cả đơn hàng
  static async syncAllOrderStatus(): Promise<{
    updated: number;
    failed: number;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      result: {
        updated: number;
        failed: number;
      };
    }>(`${this.BASE_URL}/sync-all-status`);

    return response.data.result;
  }

  // 🏷️ Tạo nhãn hàng loạt
  static async printMultipleLabels(trackingCodes: string[]): Promise<Blob> {
    const response = await apiClient.post(`${this.BASE_URL}/print-multiple-labels`, {
      trackingCodes
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  // ⚙️ Helper Methods

  // Map GHTK status sang enum của app
  static mapGhtkStatusToEnum(ghtkStatus: string): ShipmentStatus {
    switch (ghtkStatus) {
      case '1': return ShipmentStatus.PENDING;      // Chưa tiếp nhận
      case '2': return ShipmentStatus.PICKING_UP;   // Đang lấy hàng
      case '3': return ShipmentStatus.IN_TRANSIT;   // Đang trung chuyển
      case '4': return ShipmentStatus.DELIVERED;    // Đã giao
      case '5': return ShipmentStatus.CANCELLED;    // Hủy
      default: return ShipmentStatus.PENDING;
    }
  }

  // Validate trọng lượng đơn hàng
  static validateOrderWeight(products: GhtkProduct[]): {
    isValid: boolean;
    totalWeight: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let totalWeight = 0;

    for (const product of products) {
      const productWeight = product.weight * product.quantity;
      totalWeight += productWeight;

      if (product.weight > 20) {
        errors.push(`Sản phẩm "${product.name}" vượt quá khối lượng tối đa 20kg`);
      }
    }

    if (totalWeight >= 20) {
      errors.push('Tổng khối lượng đơn hàng >= 20kg, không thể gửi GHTK');
    }

    return {
      isValid: errors.length === 0,
      totalWeight,
      errors
    };
  }

  // Format trạng thái hiển thị
  static formatStatus(status: ShipmentStatus): string {
    const statusMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'Chờ xử lý',
      [ShipmentStatus.PICKING_UP]: 'Đang lấy hàng',
      [ShipmentStatus.IN_TRANSIT]: 'Đang vận chuyển',
      [ShipmentStatus.DELIVERED]: 'Đã giao hàng',
      [ShipmentStatus.RETURNING]: 'Đang hoàn trả',
      [ShipmentStatus.RETURNED]: 'Đã hoàn trả',
      [ShipmentStatus.CANCELLED]: 'Đã hủy',
    };
    return statusMap[status] || status;
  }

  // Format tiền tệ
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Tạo địa chỉ đầy đủ
  static buildFullAddress(
    street: string,
    ward: string,
    district: string,
    province: string
  ): string {
    return `${street}, ${ward}, ${district}, ${province}`;
  }

  // Validate địa chỉ
  static validateAddress(orderData: GhtkOrderRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!orderData.pick_address) errors.push('Địa chỉ lấy hàng là bắt buộc');
    if (!orderData.pick_province) errors.push('Tỉnh/thành lấy hàng là bắt buộc');
    if (!orderData.pick_district) errors.push('Quận/huyện lấy hàng là bắt buộc');
    if (!orderData.pick_ward) errors.push('Phường/xã lấy hàng là bắt buộc');
    if (!orderData.pick_tel) errors.push('SĐT lấy hàng là bắt buộc');

    if (!orderData.name) errors.push('Tên người nhận là bắt buộc');
    if (!orderData.tel) errors.push('SĐT người nhận là bắt buộc');
    if (!orderData.address) errors.push('Địa chỉ giao hàng là bắt buộc');
    if (!orderData.province) errors.push('Tỉnh/thành giao hàng là bắt buộc');
    if (!orderData.district) errors.push('Quận/huyện giao hàng là bắt buộc');
    if (!orderData.ward) errors.push('Phường/xã giao hàng là bắt buộc');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default GhtkService;