import { LoginRequest, LoginResponse } from '../types/auth.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.30:8080';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('ApiService: Calling login API...');
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('ApiService: Response status:', response.status);
      const data: LoginResponse = await response.json();
      console.log('ApiService: Response data status:', data.status);
      console.log('ApiService: Response message:', data.message);

      // Kiểm tra application status từ response body
      // API có thể trả về status là "ERROR" hoặc status code khác 200/SUCCESS
      if (data.status === 'ERROR' || (typeof data.status === 'number' && data.status >= 400)) {
        throw new Error(data.message || 'Login failed');
      }

      // Nếu status là SUCCESS hoặc 200, return luôn
      if (data.status === 'SUCCESS' || data.status === 200 || response.ok) {
        console.log('ApiService: Login successful');
        return data;
      }

      // Fallback: throw error nếu không match các case trên
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      console.error('ApiService: Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);
