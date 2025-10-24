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

// Utility function to calculate voucher discount
export const calculateVoucherDiscount = (voucher: VoucherResponseDto, orderTotal: number): number => {
  // Check if order meets minimum value requirement
  if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
    return 0;
  }

  let discount = 0;
  
  if (voucher.discountType === DiscountType.PERCENTAGE) {
    discount = (orderTotal * voucher.discountValue) / 100;
    // Apply max discount limit if exists
    if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
      discount = voucher.maxDiscountAmount;
    }
  } else if (voucher.discountType === DiscountType.FIXED_AMOUNT) {
    discount = voucher.discountValue;
    // For fixed amount, max discount amount is usually the discount value itself
    if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
      discount = voucher.maxDiscountAmount;
    }
  }

  return Math.min(discount, orderTotal); // Can't discount more than order total
};

// Utility function to check if voucher is applicable
export const isVoucherApplicable = (voucher: VoucherResponseDto, orderTotal: number, items?: any[]): boolean => {
  // Check if voucher is active
  if (!voucher.active) return false;
  
  // Check if voucher is within date range
  const now = new Date();
  const startDate = new Date(voucher.startDate);
  const endDate = new Date(voucher.endDate);
  
  if (now < startDate || now > endDate) return false;
  
  // Check if usage limit is not exceeded
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return false;
  
  // Check minimum order value
  if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) return false;
  
  // For SHOP vouchers, check if all items belong to the same shop as the voucher
  if (voucher.type === VoucherType.SHOP && voucher.shopId && items) {
    // Check if all items belong to the voucher's shop
    const allItemsBelongToShop = items.every(item => item.shopId === voucher.shopId);
    if (!allItemsBelongToShop) return false;
  }
  
  return true;
};

// Utility function to filter vouchers applicable to specific items
export const filterApplicableVouchers = (vouchers: VoucherResponseDto[], orderTotal: number, items: any[]): VoucherResponseDto[] => {
  return vouchers.filter(voucher => {
    // System and shipping vouchers are available to all
    if (voucher.type === VoucherType.SYSTEM || voucher.type === VoucherType.SHIPPING) {
      return isVoucherApplicable(voucher, orderTotal, items);
    }
    
    // Shop vouchers are only available if all items belong to the same shop
    if (voucher.type === VoucherType.SHOP) {
      return isVoucherApplicable(voucher, orderTotal, items);
    }
    
    return false;
  });
};

export const voucherApiService = {
  // Create voucher
  async createVoucher(data: VoucherRequestDto): Promise<VoucherResponseDto> {
    const response = await apiClient.post<VoucherResponseDto>('/vouchers', data);
    return response.data;
  },

  // Get all vouchers
  async getAllVouchers(): Promise<VoucherResponseDto[]> {
    const response = await apiClient.get<VoucherResponseDto[]>('/vouchers');
    return response.data;
  },

  // Get voucher by code
  async getVoucherByCode(code: string): Promise<VoucherResponseDto> {
    const response = await apiClient.get<VoucherResponseDto>(`/vouchers/${code}`);
    return response.data;
  },

  // Deactivate voucher
  async deactivateVoucher(id: string): Promise<VoucherResponseDto> {
    const response = await apiClient.put<VoucherResponseDto>(`/vouchers/${id}/deactivate`);
    return response.data;
  }
};