import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UpdateUserProfileDto, ChangePasswordDto, UserRole } from '../types/user.types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (role: UserRole, page: number, size: number, sort?: string) =>
    [...userKeys.lists(), { role, page, size, sort }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  currentUser: () => [...userKeys.all, 'current'] as const,
};

// Get current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.currentUser(),
    queryFn: () => userService.getCurrentUserProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserProfileById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get all users by role (Admin only)
export function useUsers(
  role: UserRole = 'USER',
  page: number = 0,
  size: number = 20,
  sort?: string
) {
  return useQuery({
    queryKey: userKeys.list(role, page, size, sort),
    queryFn: () => userService.getAllUsersByRole(role, page, size, sort),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update current user profile mutation
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileData,
      avatar,
    }: {
      profileData: UpdateUserProfileDto;
      avatar?: File;
    }) => userService.updateCurrentUserProfile(profileData, avatar),
    onSuccess: () => {
      // Invalidate current user and all user lists
      queryClient.invalidateQueries({ queryKey: userKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordDto) =>
      userService.changePassword(passwordData),
  });
}
