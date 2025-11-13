import { api } from './api';
import type {
  User,
  UsersPageResponse,
  UpdateUserProfileDto,
  ChangePasswordDto,
  UserRole,
} from '../types/user.types';

const API_BASE_URL = '/api/user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userService = {
  // Get current user profile
  getCurrentUserProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`${API_BASE_URL}/profile`);
    return response.data.data;
  },

  // Update current user profile
  updateCurrentUserProfile: async (
    profileData: UpdateUserProfileDto,
    avatar?: File
  ): Promise<User> => {
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));
    if (avatar) {
      formData.append('avatar', avatar);
    }

    const response = await api.put<ApiResponse<User>>(
      `${API_BASE_URL}/profile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Get user profile by ID
  getUserProfileById: async (userId: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(
      `${API_BASE_URL}/profile/${userId}`
    );
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordDto): Promise<string> => {
    const response = await api.put<ApiResponse<string>>(
      `${API_BASE_URL}/change-password`,
      passwordData
    );
    return response.data.data;
  },

  // Get all users by role (Admin only)
  getAllUsersByRole: async (
    role: UserRole = 'USER',
    page: number = 0,
    size: number = 20,
    sort?: string
  ): Promise<UsersPageResponse> => {
    const params = new URLSearchParams({
      role,
      page: page.toString(),
      size: size.toString(),
    });
    if (sort) {
      params.append('sort', sort);
    }

    const response = await api.get<ApiResponse<UsersPageResponse>>(
      `${API_BASE_URL}/admin/users?${params}`
    );
    return response.data.data;
  },
};
