import apiClient from '../lib/apiClient';
import { 
  LoginRequestDto, 
  AuthResponseDto, 
  RefreshTokenRequestDto,
  GoogleUserData,
  ApiResponse
} from '@/types/auth';

class AuthService {
  /**
   * Login with username/password
   */
  async login(credentials: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenRequest: RefreshTokenRequestDto): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiClient.post('/api/auth/refresh-token', refreshTokenRequest);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  }

  /**
   * Register/Login user from Google
   * 
   * API expects:
   * POST /api/auth/google-login
   * Body: { "idToken": "ya29.a0AV..." } - Actually accessToken
   */
  async googleAuth(googleUser: GoogleUserData): Promise<ApiResponse<AuthResponseDto>> {
    console.log('Google Auth - idToken (accessToken):', googleUser.idToken ? 'Present' : 'Missing');
    console.log('Google Auth - idToken length:', googleUser.idToken?.length || 0);
    
    try {
      const response = await apiClient.post('/api/auth/google-login', {
        idToken: googleUser.idToken
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Google Auth API Error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error Response:', axiosError.response.data);
        console.error('Error Status:', axiosError.response.status);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;