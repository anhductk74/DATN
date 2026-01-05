export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryParent {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status: CategoryStatus;
  parent?: CategoryParent | null;
  subCategories?: Category[] | null;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesPageResponse {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: CategoriesPageResponse | Category[];
}

export interface CategoryDetailApiResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  status?: CategoryStatus;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  status?: CategoryStatus;
}
