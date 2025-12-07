import { api } from './api';
import type {
  Manager,
  ManagerRegisterDto,
  ManagerRegisterResponseDto,
  UpdateManagerDto,
  ManagersPageResponse,
} from '../types/manager.types';

const API_BASE_URL = '/api/auth';
const MANAGER_API_URL = '/api/managers'; // Assuming future endpoint for manager management

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const managerService = {
  // Register new manager (Admin only)
  registerManager: async (managerData: ManagerRegisterDto): Promise<ManagerRegisterResponseDto> => {
    const response = await api.post<ApiResponse<ManagerRegisterResponseDto>>(
      `${API_BASE_URL}/register-manager`,
      managerData
    );
    return response.data.data;
  },

  // Get all managers (with pagination)
  getAllManagers: async (
    page: number = 0,
    size: number = 10,
    search?: string
  ): Promise<ManagersPageResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await api.get<ManagersPageResponse>(
      `${MANAGER_API_URL}?${params.toString()}`
    );
    return response.data;
  },

  // Get manager by ID
  getManagerById: async (id: string): Promise<Manager> => {
    const response = await api.get<Manager>(`${MANAGER_API_URL}/${id}`);
    return response.data;
  },

  // Update manager
  updateManager: async (id: string, updateData: UpdateManagerDto): Promise<Manager> => {
    const formData = new FormData();

    if (updateData.fullName) {
      formData.append('fullName', updateData.fullName);
    }
    if (updateData.phoneNumber) {
      formData.append('phoneNumber', updateData.phoneNumber);
    }
    if (updateData.avatar) {
      formData.append('avatar', updateData.avatar);
    }

    const response = await api.put<ApiResponse<Manager>>(
      `${MANAGER_API_URL}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Delete manager
  deleteManager: async (id: string): Promise<void> => {
    await api.delete(`${MANAGER_API_URL}/${id}`);
  },

  // Toggle manager active status
  toggleManagerStatus: async (id: string): Promise<Manager> => {
    const response = await api.patch<ApiResponse<Manager>>(
      `${MANAGER_API_URL}/${id}/toggle-status`
    );
    return response.data.data;
  },
};
