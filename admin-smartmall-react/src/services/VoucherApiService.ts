import { api } from './api';
import type {
  VoucherRequestDto,
  VoucherResponseDto,
} from '../types/voucher.types';

const VOUCHER_API_URL = '/api/vouchers';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const voucherService = {
  // Create voucher
  createVoucher: async (
    voucherData: VoucherRequestDto
  ): Promise<VoucherResponseDto> => {
    const response = await api.post<ApiResponse<VoucherResponseDto>>(
      VOUCHER_API_URL,
      voucherData
    );
    return response.data.data;
  },

  // Get all vouchers
  getAllVouchers: async (): Promise<VoucherResponseDto[]> => {
    try {
      console.log('🔵 Fetching vouchers from:', VOUCHER_API_URL);
      const response = await api.get<ApiResponse<VoucherResponseDto[]>>(
        VOUCHER_API_URL
      );
    
      
      // Check if response.data is already the array
      if (Array.isArray(response.data)) {
        
        return response.data;
      }
      
      // Check if response.data.data exists
      if (response.data.data) {
       
        return response.data.data;
      }
      
    
      return [];
    } catch (error) {
      console.error('❌ Error fetching vouchers:', error);
      return [];
    }
  },

  // Get voucher by code
  getVoucherByCode: async (code: string): Promise<VoucherResponseDto> => {
    const response = await api.get<ApiResponse<VoucherResponseDto>>(
      `${VOUCHER_API_URL}/${code}`
    );
    return response.data.data;
  },

  // Deactivate voucher
  deactivateVoucher: async (id: string): Promise<VoucherResponseDto> => {
    const response = await api.put<ApiResponse<VoucherResponseDto>>(
      `${VOUCHER_API_URL}/${id}/deactivate`
    );
    return response.data.data;
  },
};
