import { useQuery } from '@tanstack/react-query';
import { brandService } from '../services/brand.service';

// Query keys
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: () => [...brandKeys.lists()] as const,
  products: (brandName: string, page: number, size: number) => 
    [...brandKeys.all, 'products', brandName, { page, size }] as const,
};

// Get all brands
export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: () => brandService.getAllBrands(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get products by brand
export function useProductsByBrand(brandName: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: brandKeys.products(brandName, page, size),
    queryFn: () => brandService.getProductsByBrand(brandName, page, size),
    enabled: !!brandName,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
