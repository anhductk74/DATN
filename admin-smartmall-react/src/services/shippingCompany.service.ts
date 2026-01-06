import { api } from './api';
import type {
  ShippingCompany,
  ShippingCompanyDto,
} from '../types/shippingCompany.types';

const SHIPPING_COMPANY_API_URL = '/api/logistics/shipping-companies';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const shippingCompanyService = {
  // Create new shipping company
  create: async (companyData: ShippingCompanyDto): Promise<ShippingCompany> => {
    const response = await api.post<ShippingCompany>(
      SHIPPING_COMPANY_API_URL,
      companyData
    );
    return response.data;
  },

  // Update shipping company
  update: async (id: string, companyData: ShippingCompanyDto): Promise<ShippingCompany> => {
    const response = await api.put<ShippingCompany>(
      `${SHIPPING_COMPANY_API_URL}/${id}`,
      companyData
    );
    return response.data;
  },

  // Get all shipping companies
  getAll: async (): Promise<ShippingCompany[]> => {
    const response = await api.get<ShippingCompany[]>(
      SHIPPING_COMPANY_API_URL
    );
    return response.data;
  },

  // Search by name
  searchByName: async (name: string): Promise<ShippingCompany[]> => {
    const params = new URLSearchParams({ name });
    const response = await api.get<ShippingCompany[]>(
      `${SHIPPING_COMPANY_API_URL}/search?${params.toString()}`
    );
    return response.data;
  },

  // Get shipping company by ID
  getById: async (id: string): Promise<ShippingCompany> => {
    const response = await api.get<ShippingCompany>(
      `${SHIPPING_COMPANY_API_URL}/${id}`
    );
    return response.data;
  },

  // Delete shipping company
  delete: async (id: string): Promise<void> => {
    await api.delete(`${SHIPPING_COMPANY_API_URL}/${id}`);
  },
};
