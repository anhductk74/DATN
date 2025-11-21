import apiClient from '../lib/apiClient';
import { ApiResponse } from '@/types/auth';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: number;
  roles: string[];
}

export interface UserListDto {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  isActive: number;
}

class UserService {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));
    
    const response = await apiClient.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put('/user/change-password', passwordData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
    const response = await apiClient.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<UserListDto[]> {
    const response = await apiClient.get<UserListDto[]>('/api/user', {
      params: { role }
    });
    return response.data;
  }

  /**
   * Get users by domain
   */
  async getUsersByDomain(domain: string): Promise<UserListDto[]> {
    const response = await apiClient.get<UserListDto[]>('/api/user', {
      params: { domain }
    });
    return response.data;
  }

  /**
   * Get users by both role and domain (filters on backend)
   */
  async getUsersByRoleAndDomain(role: string, domain: string): Promise<UserListDto[]> {
    const response = await apiClient.get<UserListDto[]>('/api/user', {
      params: { role, domain }
    });
    return response.data;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;