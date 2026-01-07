import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '../services/VoucherApiService';
import type { VoucherRequestDto } from '../types/voucher.types';

// Query keys
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  detail: (code: string) => [...voucherKeys.all, 'detail', code] as const,
};

// Get all vouchers
export const useVouchers = () => {
  return useQuery({
    queryKey: voucherKeys.lists(),
    queryFn: () => voucherService.getAllVouchers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Get voucher by code
export const useVoucher = (code: string) => {
  return useQuery({
    queryKey: voucherKeys.detail(code),
    queryFn: () => voucherService.getVoucherByCode(code),
    enabled: !!code,
    staleTime: 2 * 60 * 1000,
  });
};

// Create voucher mutation
export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voucherData: VoucherRequestDto) =>
      voucherService.createVoucher(voucherData),
    onSuccess: () => {
      // Invalidate and refetch vouchers list
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
    },
  });
};

// Deactivate voucher mutation
export const useDeactivateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voucherService.deactivateVoucher(id),
    onSuccess: () => {
      // Invalidate and refetch vouchers list
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
    },
  });
};
