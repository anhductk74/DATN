import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export enum VoucherType {
  SYSTEM = 'SYSTEM',
  SHOP = 'SHOP',
  SHIPPING = 'SHIPPING',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface VoucherRequestDto {
  code: string;
  description: string;
  type: VoucherType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  shopId?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface VoucherResponseDto {
  id: string;
  code: string;
  description: string;
  type: VoucherType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  startDate: string;
  endDate: string;
  shopId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class VoucherService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess =
      response.data.success === true ||
      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data || response.data || null,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      data: null,
    };
  }

  // ==========================
  //       API METHODS
  // ==========================

  async createVoucher(data: VoucherRequestDto): Promise<ApiResponse<VoucherResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/vouchers`, data, { headers });
      return this.handleResponse<VoucherResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllVouchers(): Promise<ApiResponse<VoucherResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/vouchers`, { headers });
      return this.handleResponse<VoucherResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getVoucherByCode(code: string): Promise<ApiResponse<VoucherResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/vouchers/${code}`, { headers });
      return this.handleResponse<VoucherResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deactivateVoucher(id: string): Promise<ApiResponse<VoucherResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/api/vouchers/${id}/deactivate`, {}, { headers });
      return this.handleResponse<VoucherResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================
  //      Utility functions
  // ==========================

  calculateVoucherDiscount(voucher: VoucherResponseDto, orderTotal: number): number {
    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) return 0;

    let discount = 0;
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      discount = (orderTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    } else if (voucher.discountType === DiscountType.FIXED_AMOUNT) {
      discount = voucher.discountValue;
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    }
    return Math.min(discount, orderTotal);
  }

  isVoucherApplicable(voucher: VoucherResponseDto, orderTotal: number, items?: any[]): boolean {
    if (!voucher.active) return false;

    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    if (now < startDate || now > endDate) return false;

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return false;
    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) return false;

    if (voucher.type === VoucherType.SHOP && voucher.shopId) {
      // If there are items in the order, require at least one item from the voucher's shop
      if (items && items.length > 0) {
        const hasShopItem = items.some(item => item.shopId === voucher.shopId);
        if (!hasShopItem) return false;
      } else {
        // No items provided: conservatively treat as not applicable
        return false;
      }
    }

    return true;
  }

  filterApplicableVouchers(vouchers: VoucherResponseDto[], orderTotal: number, items: any[]): VoucherResponseDto[] {
    return vouchers.filter(voucher => this.isVoucherApplicable(voucher, orderTotal, items));
  }
}

export default new VoucherService();
