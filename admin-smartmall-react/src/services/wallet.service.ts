import { api } from './api';
import type {
  WithdrawalRequestsResponse,
  ProcessWithdrawalRequest,
  WithdrawalRequest,
  ShopWallet,
  WalletTransactionsResponse,
  WithdrawalStatus,
  ApiResponse,
} from '../types/wallet.types';

export const walletService = {
  // Lấy danh sách yêu cầu rút tiền
  getWithdrawalRequests: async (
    status?: WithdrawalStatus,
    page: number = 0,
    size: number = 10
  ): Promise<WithdrawalRequestsResponse> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get<ApiResponse<WithdrawalRequestsResponse>>(
      `/api/wallets/withdrawal-requests?${params.toString()}`
    );
    return response.data.data;
  },

  // Xử lý yêu cầu rút tiền (Phê duyệt/Từ chối)
  processWithdrawalRequest: async (
    requestId: string,
    data: ProcessWithdrawalRequest
  ): Promise<WithdrawalRequest> => {
    const response = await api.put<ApiResponse<WithdrawalRequest>>(
      `/api/wallets/withdrawal-requests/${requestId}/process`,
      data
    );
    return response.data.data;
  },

  // Xem chi tiết ví của shop
  getShopWallet: async (shopId: string): Promise<ShopWallet> => {
    const response = await api.get<ApiResponse<ShopWallet>>(`/api/wallets/shops/${shopId}`);
    return response.data.data;
  },

  // Xem lịch sử giao dịch của shop
  getShopTransactions: async (
    shopId: string,
    page: number = 0,
    size: number = 20
  ): Promise<WalletTransactionsResponse> => {
    const response = await api.get<ApiResponse<WalletTransactionsResponse>>(
      `/api/wallets/shops/${shopId}/transactions`,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },

  // Xem chi tiết một yêu cầu rút tiền
  getWithdrawalRequestDetail: async (requestId: string): Promise<WithdrawalRequest> => {
    const response = await api.get<ApiResponse<WithdrawalRequest>>(
      `/api/wallets/withdrawal-requests/${requestId}`
    );
    return response.data.data;
  },
};
