import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string | null;
  avatar: string | null;
  isActive: number;
  roles: string[];
}

interface Address {
  id: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
}

interface AddAddressRequest {
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class UserService {
  private getAuthHeader(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    // Backend có thể trả về format khác nhau
    // Format 1: { success: true, message: "...", data: {...} }
    // Format 2: { status: 200, message: "...", data: {...} }
    const isSuccess = response.data.success === true || 
                      (response.data.status >= 200 && response.data.status < 300);
    
    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        data: null,
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      data: null,
    };
  }

  async getProfile(token: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        headers: this.getAuthHeader(token),
      });
      return this.handleResponse<UserProfile>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(token: string, data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, data, {
        headers: this.getAuthHeader(token),
      });
      return this.handleResponse<UserProfile>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadAvatar(token: string, imageUri: string): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await axios.post(
        `${API_BASE_URL}/api/user/profile/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return this.handleResponse<{ avatarUrl: string }>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAddresses(token: string): Promise<ApiResponse<Address[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/addresses`, {
        headers: this.getAuthHeader(token),
      });
      return this.handleResponse<Address[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addAddress(token: string, data: AddAddressRequest): Promise<ApiResponse<Address>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/addresses`, data, {
        headers: this.getAuthHeader(token),
      });
      return this.handleResponse<Address>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateAddress(token: string, addressId: string, data: AddAddressRequest): Promise<ApiResponse<Address>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/user/addresses/${addressId}`,
        data,
        {
          headers: this.getAuthHeader(token),
        }
      );
      return this.handleResponse<Address>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteAddress(token: string, addressId: string): Promise<ApiResponse> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/user/addresses/${addressId}`,
        {
          headers: this.getAuthHeader(token),
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async setDefaultAddress(token: string, addressId: string): Promise<ApiResponse<Address>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/user/addresses/${addressId}/set-default`,
        {},
        {
          headers: this.getAuthHeader(token),
        }
      );
      return this.handleResponse<Address>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async changePassword(token: string, data: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/user/change-password`,
        data,
        {
          headers: this.getAuthHeader(token),
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const userService = new UserService();
export type { UserProfile, Address, UpdateProfileRequest, AddAddressRequest, ChangePasswordRequest };
