import apiClient from './apiClient';
import { ApiResponse, UserProfile } from '@/types/common';

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
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put('/user/change-password', passwordData);
    return response.data;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
    const response = await apiClient.post('/user/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;