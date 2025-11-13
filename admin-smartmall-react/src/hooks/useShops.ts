import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '../services/shop.service';
import type { CreateShopDto, UpdateShopDto } from '../types/shop.types';

// Query keys
export const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (page: number, size: number, sort?: string) =>
    [...shopKeys.lists(), { page, size, sort }] as const,
  details: () => [...shopKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopKeys.details(), id] as const,
  byOwner: (ownerId: string) => [...shopKeys.all, 'owner', ownerId] as const,
  search: (name: string) => [...shopKeys.all, 'search', name] as const,
};

// Get all shops (paginated)
export function useShops(page: number = 0, size: number = 20, sort?: string) {
  return useQuery({
    queryKey: shopKeys.list(page, size, sort),
    queryFn: () => shopService.getAllShops(page, size, sort),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get shop by ID
export function useShop(id: string) {
  return useQuery({
    queryKey: shopKeys.detail(id),
    queryFn: () => shopService.getShopById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get shops by owner
export function useShopsByOwner(ownerId: string) {
  return useQuery({
    queryKey: shopKeys.byOwner(ownerId),
    queryFn: () => shopService.getShopsByOwner(ownerId),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5,
  });
}

// Search shops
export function useSearchShops(name: string) {
  return useQuery({
    queryKey: shopKeys.search(name),
    queryFn: () => shopService.searchShops(name),
    enabled: !!name && name.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

// Create shop mutation
export function useCreateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shopData,
      image,
    }: {
      shopData: CreateShopDto;
      image: File;
    }) => shopService.createShop(shopData, image),
    onSuccess: () => {
      // Invalidate all shop lists
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
  });
}

// Update shop mutation
export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      shopData,
      image,
    }: {
      id: string;
      shopData: UpdateShopDto;
      image?: File;
    }) => shopService.updateShop(id, shopData, image),
    onSuccess: (_, variables) => {
      // Invalidate shop lists and specific shop detail
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shopKeys.detail(variables.id) });
    },
  });
}

// Delete shop mutation
export function useDeleteShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shopService.deleteShop(id),
    onSuccess: () => {
      // Invalidate all shop lists
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
  });
}
