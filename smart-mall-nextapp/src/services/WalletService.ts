import apiClient from '../lib/apiClient';
import { ApiResponse } from '@/types/common';

// Wallet Response
export interface WalletResponse {
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

// Create Wallet Request
export interface CreateWalletRequest {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

// Update Bank Info Request
export interface UpdateBankInfoRequest {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

// Withdrawal Request
export interface CreateWithdrawalRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  note?: string;
}

// Withdrawal Response
export interface WithdrawalResponse {
  id: string;
  shopId: string;
  shopName: string;
  walletId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
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

// Process Withdrawal Request (Admin)
export interface ProcessWithdrawalRequest {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

// Wallet Transaction Response
export interface WalletTransactionResponse {
  id: string;
  walletId: string;
  type: 'ORDER_PAYMENT' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string;
  withdrawalRequestId?: string;
  description: string;
  referenceCode: string;
  createdAt: string;
}

// Wallet Statistics Response
export interface WalletStatisticsResponse {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;
  availableForWithdrawal: number;
}

// Temporary Wallet Response
export interface TemporaryWallet {
  id: string;
  shopId: string;
  shopName: string;
  orderId: string;
  amount: number;
  isTransferred: boolean;
  transferredAt?: string;
  note: string;
  createdAt: string;
}

export interface TemporaryWalletSummary {
  temporaryWallets: TemporaryWallet[];
  totalAmount: number;
  count: number;
  message: string;
}

// Page Response
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

class WalletService {
  /**
   * Create wallet for shop with bank information
   * POST /api/wallets/shops/{shopId}
   */
  async createWallet(shopId: string, request: CreateWalletRequest): Promise<ApiResponse<WalletResponse>> {
    const response = await apiClient.post(`/wallets/shops/${shopId}`, request);
    return response.data;
  }

  /**
   * Get wallet information
   * GET /api/wallets/shops/{shopId}
   */
  async getWallet(shopId: string): Promise<ApiResponse<WalletResponse>> {
    const response = await apiClient.get(`/wallets/shops/${shopId}`);
    return response.data;
  }

  /**
   * Update bank information
   * PUT /api/wallets/shops/{shopId}/bank-info
   */
  async updateBankInfo(shopId: string, request: UpdateBankInfoRequest): Promise<ApiResponse<WalletResponse>> {
    const response = await apiClient.put(`/wallets/shops/${shopId}/bank-info`, request);
    return response.data;
  }

  /**
   * Create withdrawal request
   * POST /api/wallets/shops/{shopId}/withdrawal-requests
   */
  async createWithdrawalRequest(shopId: string, request: CreateWithdrawalRequest): Promise<ApiResponse<WithdrawalResponse>> {
    const response = await apiClient.post(`/wallets/shops/${shopId}/withdrawal-requests`, request);
    return response.data;
  }

  /**
   * Get withdrawal requests for shop
   * GET /api/wallets/shops/{shopId}/withdrawal-requests
   */
  async getWithdrawalRequests(
    shopId: string, 
    page: number = 0, 
    size: number = 10
  ): Promise<ApiResponse<PageResponse<WithdrawalResponse>>> {
    const response = await apiClient.get(`/wallets/shops/${shopId}/withdrawal-requests`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Admin: Get all withdrawal requests
   * GET /api/wallets/withdrawal-requests
   */
  async getAllWithdrawalRequests(
    status: string = 'PENDING',
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<WithdrawalResponse>>> {
    const response = await apiClient.get('/wallets/withdrawal-requests', {
      params: { status, page, size }
    });
    return response.data;
  }

  /**
   * Admin: Process withdrawal request
   * PUT /api/wallets/withdrawal-requests/{requestId}/process
   */
  async processWithdrawalRequest(
    requestId: string,
    request: ProcessWithdrawalRequest
  ): Promise<ApiResponse<WithdrawalResponse>> {
    const response = await apiClient.put(`/wallets/withdrawal-requests/${requestId}/process`, request);
    return response.data;
  }

  /**
   * Get wallet transactions
   * GET /api/wallets/shops/{shopId}/transactions
   */
  async getTransactions(
    shopId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<WalletTransactionResponse>>> {
    const response = await apiClient.get(`/wallets/shops/${shopId}/transactions`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Get wallet statistics
   * GET /api/wallets/shops/{shopId}/statistics
   */
  async getStatistics(shopId: string): Promise<ApiResponse<WalletStatisticsResponse>> {
    const response = await apiClient.get(`/wallets/shops/${shopId}/statistics`);
    return response.data;
  }

  /**
   * Get temporary wallet (when main wallet not created yet)
   * GET /api/wallets/shops/{shopId}/temporary
   */
  async getTemporaryWallet(shopId: string): Promise<ApiResponse<TemporaryWalletSummary>> {
    const response = await apiClient.get(`/wallets/shops/${shopId}/temporary`);
    return response.data;
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;
