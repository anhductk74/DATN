import apiClient from '../lib/apiClient';
import { UserProfile, Address, ApiResponse } from '../types';

class UserService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${userId}`);
    return response.data.data;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<UserProfile>>(`/users/${userId}`, data);
    return response.data.data;
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    const response = await apiClient.get<ApiResponse<Address[]>>(`/users/${userId}/addresses`);
    return response.data.data;
  }

  async addAddress(userId: string, address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const response = await apiClient.post<ApiResponse<Address>>(`/users/${userId}/addresses`, address);
    return response.data.data;
  }

  async updateAddress(userId: string, addressId: string, address: Partial<Address>): Promise<Address> {
    const response = await apiClient.put<ApiResponse<Address>>(`/users/${userId}/addresses/${addressId}`, address);
    return response.data.data;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/addresses/${addressId}`);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await apiClient.put(`/users/${userId}/addresses/${addressId}/default`);
  }
}

const userService = new UserService();
export default userService;
