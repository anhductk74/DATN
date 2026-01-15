import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import type { WithdrawalStatus, ProcessWithdrawalRequest } from '../types/wallet.types';

export const useWithdrawalRequests = (status?: WithdrawalStatus, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: ['withdrawalRequests', status, page, size],
    queryFn: () => walletService.getWithdrawalRequests(status, page, size),
  });
};

export const useProcessWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ProcessWithdrawalRequest }) =>
      walletService.processWithdrawalRequest(requestId, data),
    onSuccess: () => {
      // Invalidate tất cả các query liên quan đến withdrawal requests
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['shopWallet'] });
    },
  });
};

export const useShopWallet = (shopId: string) => {
  return useQuery({
    queryKey: ['shopWallet', shopId],
    queryFn: () => walletService.getShopWallet(shopId),
    enabled: !!shopId,
  });
};

export const useShopTransactions = (shopId: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ['shopTransactions', shopId, page, size],
    queryFn: () => walletService.getShopTransactions(shopId, page, size),
    enabled: !!shopId,
  });
};

export const useWithdrawalRequestDetail = (requestId: string) => {
  return useQuery({
    queryKey: ['withdrawalRequest', requestId],
    queryFn: () => walletService.getWithdrawalRequestDetail(requestId),
    enabled: !!requestId,
  });
};
