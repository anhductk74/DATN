import axios from 'axios';

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth`;

interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginCodeRequest {
  username: string;
}

interface VerifyCodeRequest {
  username: string;
  code: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userInfo: {
      id: string;
      username: string;
      fullName: string;
      phoneNumber: string | null;
      avatar: string | null;
      isActive: number;
      roles: string[];
    };
  } | null;
}

interface ApiResponse {
  status: number;
  message: string;
  data: any;
}

class AuthService {
  private async handleResponse(response: any): Promise<AuthResponse> {
    const apiResponse: ApiResponse = response.data;
    
    return {
      success: apiResponse.status >= 200 && apiResponse.status < 300,
      message: apiResponse.message,
      data: apiResponse.data,
    };
  }

  private async handleError(error: any): Promise<AuthResponse> {
    if (error.response?.data) {
      const apiResponse: ApiResponse = error.response.data;
      return {
        success: false,
        message: apiResponse.message || 'An error occurred',
        data: null,
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      data: null,
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async loginWithPassword(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async sendLoginCode(username: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/mobile/send-login-code`, {
        username,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyLoginCode(username: string, code: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/mobile/verify-login-code`, {
        username,
        code,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
        refreshToken,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authService = new AuthService();
