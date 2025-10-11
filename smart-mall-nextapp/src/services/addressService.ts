import apiClient from '../lib/apiClient';

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  id: string;
  recipient: string;
  phoneNumber: string;
  addressType: AddressType;
  street: string;
  commune: string;
  district: string;
  city: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  recipient: string;
  phoneNumber: string;
  addressType: AddressType;
  street: string;
  commune: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  recipient?: string;
  phoneNumber?: string;
  addressType?: AddressType;
  street?: string;
  commune?: string;
  district?: string;
  city?: string;
  isDefault?: boolean;
}

const addressService = {
  /**
   * Get all addresses of current user
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<{ data: Address[] }>('/addresses');
    return response.data.data;
  },

  /**
   * Get address by ID
   */
  async getAddress(addressId: string): Promise<Address> {
    const response = await apiClient.get<{ data: Address }>(`/addresses/${addressId}`);
    return response.data.data;
  },

  /**
   * Create new address
   */
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await apiClient.post<{ data: Address }>('/addresses', data);
    return response.data.data;
  },

  /**
   * Update address
   */
  async updateAddress(addressId: string, data: UpdateAddressRequest): Promise<Address> {
    const response = await apiClient.put<{ data: Address }>(`/addresses/${addressId}`, data);
    return response.data.data;
  },

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(`/addresses/${addressId}`);
  },

  /**
   * Get default address
   */
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const addresses = await this.getAddresses();
      return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    } catch (error) {
      return null;
    }
  },
};

export default addressService;
