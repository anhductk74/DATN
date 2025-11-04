/**
 * @deprecated This file is deprecated. Please use services from @/services instead.
 * 
 * Migration guide:
 * - Replace `authApi` with `authService` from '@/services'
 * - Replace `apiClient` with `apiClient` from '@/services'
 * 
 * This file is kept for backward compatibility and will be removed in future versions.
 */

import { 
  LoginRequestDto, 
  AuthResponseDto, 
  ApiResponse, 
  RefreshTokenRequestDto,
  GoogleUserData
} from '@/types/auth';

// UserProfile type definition (moved from common.ts)
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

// Import from new services
import { authService, userService, apiClient } from '@/services';

/**
 * @deprecated Use authService from '@/services' instead
 */
export const authApi = {
  /**
   * @deprecated Use authService.login() instead
   */
  login: async (credentials: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    return authService.login(credentials);
  },

  /**
   * @deprecated Use authService.refreshToken() instead
   */
  refreshToken: async (refreshTokenRequest: RefreshTokenRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    return authService.refreshToken(refreshTokenRequest);
  },

  /**
   * @deprecated Use authService.logout() instead
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return authService.logout();
  },

  /**
   * @deprecated Use userService.getUserProfile() instead
   */
  getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return userService.getUserProfile();
  },

  /**
   * @deprecated Use authService.googleAuth() instead
   */
  googleAuth: async (googleUser: GoogleUserData): Promise<ApiResponse<AuthResponseDto>> => {
    return authService.googleAuth(googleUser);
  }
};

/**
 * @deprecated Use apiClient from '@/services' instead
 */
export default apiClient;