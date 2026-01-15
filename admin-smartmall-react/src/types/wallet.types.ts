export const WithdrawalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;

export type WithdrawalStatus = typeof WithdrawalStatus[keyof typeof WithdrawalStatus];

export const TransactionType = {
  WITHDRAWAL: 'WITHDRAWAL',
  ORDER_REVENUE: 'ORDER_REVENUE',
  REFUND: 'REFUND',
  COMMISSION: 'COMMISSION',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface WithdrawalRequest {
  id: string;
  shopId: string;
  shopName: string;
  walletId: string;
  amount: number;
  status: WithdrawalStatus;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  note?: string;
  adminNote?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopWallet {
  id: string;
  shopId: string;
  shopName: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceCode: string;
  createdAt: string;
}

export interface ProcessWithdrawalRequest {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

export interface WithdrawalRequestsResponse {
  content: WithdrawalRequest[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
}

export interface WalletTransactionsResponse {
  content: WalletTransaction[];
  totalPages: number;
  totalElements: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}
