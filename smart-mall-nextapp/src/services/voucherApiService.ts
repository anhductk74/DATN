import apiClient from '../lib/apiClient';

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

export enum VoucherType {
  SYSTEM = 'SYSTEM',
  SHOP = 'SHOP',
  SHIPPING = 'SHIPPING'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export const voucherApiService = {
  // Create voucher
  async createVoucher(data: VoucherRequestDto): Promise<VoucherResponseDto> {
    const response = await apiClient.post<VoucherResponseDto>('/api/vouchers', data);
    return response.data;
  },

  // Get all vouchers
  async getAllVouchers(): Promise<VoucherResponseDto[]> {
    const response = await apiClient.get<VoucherResponseDto[]>('/api/vouchers');
    return response.data;
  },

  // Get voucher by code
  async getVoucherByCode(code: string): Promise<VoucherResponseDto> {
    const response = await apiClient.get<VoucherResponseDto>(`/api/vouchers/${code}`);
    return response.data;
  },

  // Deactivate voucher
  async deactivateVoucher(id: string): Promise<VoucherResponseDto> {
    const response = await apiClient.put<VoucherResponseDto>(`/api/vouchers/${id}/deactivate`);
    return response.data;
  }
};