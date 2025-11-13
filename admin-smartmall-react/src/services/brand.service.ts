import { api } from './api';
import type { ProductApiResponse } from '../types/product.types';
import type { Brand } from '../types/brand.types';

export const brandService = {
  // Get all brands (extract from products)
  getAllBrands: async (): Promise<Brand[]> => {
    // Get all products without pagination to extract brands
    const response = await api.get<ProductApiResponse>('/api/products/all');
    const products = Array.isArray(response.data.data) 
      ? response.data.data 
      : [];

    // Extract unique brands and count products
    const brandMap = new Map<string, number>();
    
    products.forEach((product) => {
      const brand = product.brand;
      if (brand) {
        brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
      }
    });

    // Convert to array and sort by product count
    const brands: Brand[] = Array.from(brandMap.entries())
      .map(([name, productCount]) => ({
        name,
        productCount,
      }))
      .sort((a, b) => b.productCount - a.productCount);

    return brands;
  },

  // Get products by brand
  getProductsByBrand: async (brandName: string, page: number = 0, size: number = 20) => {
    const response = await api.get<ProductApiResponse>('/api/products/advanced-search/paged', {
      params: { brand: brandName, page, size },
    });
    return response.data;
  },
};
