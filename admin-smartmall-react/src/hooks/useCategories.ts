import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...categoryKeys.lists(), { page, size }] as const,
  search: (name: string, page: number, size: number) => 
    [...categoryKeys.all, 'search', { name, page, size }] as const,
  active: (page: number, size: number) => 
    [...categoryKeys.all, 'active', { page, size }] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

// Fetch categories with pagination
export const useCategories = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.list(page, size),
    queryFn: () => categoryService.getCategories(page, size),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories change less frequently
  });
};

// Search categories
export const useSearchCategories = (name: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.search(name, page, size),
    queryFn: () => categoryService.searchCategories(name, page, size),
    enabled: !!name, // Only run when name is not empty
    staleTime: 3 * 60 * 1000,
  });
};

// Get active categories
export const useActiveCategories = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.active(page, size),
    queryFn: () => categoryService.getActiveCategories(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

// Get category by ID
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => categoryService.createCategory(formData),
    onSuccess: () => {
      // Invalidate all category lists to refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => 
      categoryService.updateCategory(id, formData),
    onSuccess: (_, variables) => {
      // Invalidate specific category and all lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Soft delete category
export const useSoftDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.softDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Restore category
export const useRestoreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.restoreCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Delete category permanently
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
