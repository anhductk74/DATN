import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...categoryKeys.lists(), { page, size }] as const,
  allFlat: () => [...categoryKeys.all, 'flat'] as const,
  rootCategories: () => [...categoryKeys.all, 'root'] as const,
  rootCategoriesPaged: (page: number, size: number) => [...categoryKeys.rootCategories(), { page, size }] as const,
  search: (name: string) => [...categoryKeys.all, 'search', { name }] as const,
  searchPaged: (name: string, page: number, size: number) => 
    [...categoryKeys.all, 'search', { name, page, size }] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
  subCategories: (parentId: string) => [...categoryKeys.all, 'subcategories', parentId] as const,
  subCategoriesPaged: (parentId: string, page: number, size: number) => 
    [...categoryKeys.subCategories(parentId), { page, size }] as const,
};

// Fetch categories with pagination
export const useCategories = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.list(page, size),
    queryFn: () => categoryService.getCategories(page, size),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories change less frequently
  });
};

// Get all categories (flat list)
export const useAllCategories = () => {
  return useQuery({
    queryKey: categoryKeys.allFlat(),
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

// Get root categories (with subcategories)
export const useRootCategories = () => {
  return useQuery({
    queryKey: categoryKeys.rootCategories(),
    queryFn: () => categoryService.getRootCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

// Get root categories with pagination
export const useRootCategoriesPaged = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.rootCategoriesPaged(page, size),
    queryFn: () => categoryService.getRootCategoriesPaged(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

// Get subcategories by parent ID
export const useSubCategories = (parentId: string) => {
  return useQuery({
    queryKey: categoryKeys.subCategories(parentId),
    queryFn: () => categoryService.getSubCategories(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get subcategories with pagination
export const useSubCategoriesPaged = (parentId: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.subCategoriesPaged(parentId, page, size),
    queryFn: () => categoryService.getSubCategoriesPaged(parentId, page, size),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Search categories
export const useSearchCategories = (name: string) => {
  return useQuery({
    queryKey: categoryKeys.search(name),
    queryFn: () => categoryService.searchCategories(name),
    enabled: !!name,
    staleTime: 3 * 60 * 1000,
  });
};

// Search categories with pagination
export const useSearchCategoriesPaged = (name: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: categoryKeys.searchPaged(name, page, size),
    queryFn: () => categoryService.searchCategoriesPaged(name, page, size),
    enabled: !!name,
    staleTime: 3 * 60 * 1000,
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
      // Invalidate all category queries to refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};
