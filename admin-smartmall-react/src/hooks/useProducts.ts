import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...productKeys.lists(), { page, size }] as const,
  search: (name: string, page: number, size: number) => 
    [...productKeys.all, 'search', { name, page, size }] as const,
  status: (status: string, page: number, size: number) => 
    [...productKeys.all, 'status', { status, page, size }] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

// Fetch products with pagination
export const useProducts = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: productKeys.list(page, size),
    queryFn: () => productService.getProducts(page, size),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Search products
export const useSearchProducts = (name: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: productKeys.search(name, page, size),
    queryFn: () => productService.searchProducts(name, page, size),
    enabled: !!name, // Only run when name is not empty
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get products by status
export const useProductsByStatus = (status: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: productKeys.status(status, page, size),
    queryFn: () => productService.getProductsByStatus(status, page, size),
    enabled: !!status,
    staleTime: 2 * 60 * 1000,
  });
};

// Get product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

// Soft delete product
export const useSoftDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.softDeleteProduct(id),
    onSuccess: () => {
      // Invalidate and refetch product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Restore product
export const useRestoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.restoreProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Delete product permanently
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
