import apiClient from '../lib/apiClient';

export interface AddressDto {
  id: string;
  userId?: string;
  recipient: string;
  phoneNumber: string;
  street: string;
  commune: string;
  district: string;
  city: string;
  fullAddress: string;
  default: boolean;
  addressType: AddressType;
  status: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  userId: string;
  recipient: string;
  phoneNumber: string;
  street: string;
  commune: string;
  district: string;
  city: string;
  fullAddress?: string;
  default?: boolean;
  addressType: AddressType;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressDto {
  recipient?: string;
  phoneNumber?: string;
  street?: string;
  commune?: string;
  district?: string;
  city?: string;
  fullAddress?: string;
  default?: boolean;
  addressType?: AddressType;
  latitude?: number;
  longitude?: number;
}

export enum AddressType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  WORK = 'WORK',
  OTHER = 'OTHER'
}

export interface LocationData {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
}

export interface Province {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
}

export interface District {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  provinceCode: string;
}

export interface Ward {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  districtCode: string;
}

export const addressApiService = {
  // Get addresses by user
  async getAddressesByUser(userId: string): Promise<AddressDto[]> {
    const response = await apiClient.get<AddressDto[]>(`/addresses/user/${userId}`);
    return response.data;
  },

  // Get address by ID
  async getAddressById(id: string): Promise<AddressDto> {
    const response = await apiClient.get<AddressDto>(`/addresses/${id}`);
    return response.data;
  },

  // Create address
  async createAddress(data: CreateAddressDto): Promise<AddressDto> {
    const response = await apiClient.post<AddressDto>('/addresses', data);
    return response.data;
  },

  // Update address
  async updateAddress(id: string, data: UpdateAddressDto): Promise<AddressDto> {
    const response = await apiClient.put<AddressDto>(`/addresses/${id}`, data);
    return response.data;
  },

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },

  // Set default address
  async setDefaultAddress(userId: string, addressId: string): Promise<AddressDto> {
    const response = await apiClient.put<AddressDto>(
      `/addresses/user/${userId}/default/${addressId}`
    );
    return response.data;
  },

  // Get default address
  async getDefaultAddress(userId: string): Promise<AddressDto | null> {
    try {
      const response = await apiClient.get<AddressDto>(`/addresses/user/${userId}/default`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Validate address
  async validateAddress(data: CreateAddressDto): Promise<{ isValid: boolean; message?: string }> {
    const response = await apiClient.post<{ isValid: boolean; message?: string }>(
      '/addresses/validate',
      data
    );
    return response.data;
  }
};