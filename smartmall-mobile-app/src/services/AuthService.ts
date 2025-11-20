import apiClient from '../lib/apiClient';
import {
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponseDto,
  RefreshTokenRequestDto,
  GoogleUserData,
  ApiResponse,
} from '../types';

class AuthService {
  /**
   * Login with username/password
   */
  async login(credentials: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequestDto): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshTokenRequest: RefreshTokenRequestDto
  ): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiClient.post('/auth/refresh-token', refreshTokenRequest);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  /**
   * Register/Login user from Google
   */
  async googleAuth(googleUser: GoogleUserData): Promise<ApiResponse<AuthResponseDto>> {
    try {
      const response = await apiClient.post('/auth/google-login', {
        idToken: googleUser.idToken,
      });
      return response.data;
    } catch (error: any) {
      console.error('Google Auth API Error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
