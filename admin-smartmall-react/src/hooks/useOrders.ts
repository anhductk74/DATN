import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import type { OrderStatus, UpdateOrderStatusRequest } from '../types/order.types';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (page: number, size: number, status?: string) => 
    [...orderKeys.lists(), { page, size, status }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Get all orders with pagination (Admin)
export function useOrders(page: number = 0, size: number = 20, status?: OrderStatus) {
  return useQuery({
    queryKey: orderKeys.list(page, size, status),
    queryFn: () => orderService.getAllOrders(page, size, status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrderStatusRequest) => orderService.updateOrderStatus(data),
    onSuccess: () => {
      // Invalidate all order queries to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, userId, reason }: { orderId: string; userId: string; reason?: string }) =>
      orderService.cancelOrder(orderId, userId, reason),
    onSuccess: () => {
      // Invalidate all order queries to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
