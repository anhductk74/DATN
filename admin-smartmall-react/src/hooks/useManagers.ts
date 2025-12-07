import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { managerService } from '../services/manager.service';
import type {
  Manager,
  ManagerRegisterDto,
  UpdateManagerDto,
} from '../types/manager.types';

// Query keys
const MANAGERS_QUERY_KEY = 'managers';

// Get all managers with pagination
export const useManagers = (
  page: number = 0,
  size: number = 10,
  search?: string
) => {
  return useQuery({
    queryKey: [MANAGERS_QUERY_KEY, page, size, search],
    queryFn: () => managerService.getAllManagers(page, size, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get manager by ID
export const useManager = (id: string) => {
  return useQuery({
    queryKey: [MANAGERS_QUERY_KEY, id],
    queryFn: () => managerService.getManagerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Register new manager (Admin only)
export const useRegisterManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (managerData: ManagerRegisterDto) =>
      managerService.registerManager(managerData),
    onSuccess: () => {
      message.success('Manager registered successfully!');
      queryClient.invalidateQueries({ queryKey: [MANAGERS_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to register manager';
      message.error(errorMessage);
    },
  });
};

// Update manager
export const useUpdateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManagerDto }) =>
      managerService.updateManager(id, data),
    onSuccess: (updatedManager: Manager) => {
      message.success('Manager status updated successfully!');
      queryClient.invalidateQueries({ queryKey: [MANAGERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MANAGERS_QUERY_KEY, updatedManager.managerId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update manager';
      message.error(errorMessage);
    },
  });
};

// Delete manager
export const useDeleteManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => managerService.deleteManager(id),
    onSuccess: () => {
      message.success('Manager deleted successfully!');
      queryClient.invalidateQueries({ queryKey: [MANAGERS_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete manager';
      message.error(errorMessage);
    },
  });
};

// Toggle manager active status
export const useToggleManagerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => managerService.toggleManagerStatus(id),
    onSuccess: (updatedManager: Manager) => {
      message.success(
        `Manager ${updatedManager.isActive ? 'activated' : 'deactivated'} successfully!`
      );
      queryClient.invalidateQueries({ queryKey: [MANAGERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MANAGERS_QUERY_KEY, updatedManager.managerId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to toggle manager status';
      message.error(errorMessage);
    },
  });
};
