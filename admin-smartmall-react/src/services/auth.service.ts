import { api } from './api';
import type { LoginRequest, AuthResponse } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },
};
