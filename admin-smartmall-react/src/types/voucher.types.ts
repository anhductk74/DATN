/* =======================
   ENUMS
======================= */

export const VoucherType = {
  SYSTEM: 'SYSTEM',
  SHOP: 'SHOP',
  SHIPPING: 'SHIPPING',
} as const;

export type VoucherType = typeof VoucherType[keyof typeof VoucherType];

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;

export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

/* =======================
   DTOS
======================= */

export interface VoucherRequestDto {
  code: string;
  description: string;
  type: VoucherType;
  discountType: DiscountType;
  discountValue: number;

  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;

  shopId?: string; // UUID string
  startDate: string; // ISO string
  endDate: string;   // ISO string

  active: boolean;
}

export interface VoucherResponseDto {
  id: string; // UUID
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
