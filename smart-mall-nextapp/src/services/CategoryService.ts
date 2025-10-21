import apiClient from '../lib/apiClient';

export interface Category {
  id: string;
  name: string;
  description: string;
  parent?: {
    id: string;
    name: string;
    description: string;
    parent: null;
    subCategories: Category[];
    createdAt: string;
    updatedAt: string;
  } | null;
  subCategories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string | null;
}

class CategoryService {
  // Create new category
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post('/categories', categoryData);
    return response.data.data;
  }

  // Get all root categories (with hierarchy)
  async getRootCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories/root');
    return response.data.data;
  }

  // Get all categories (flat list)
  async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories/all');
    return response.data.data;
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.data;
  }

  // Get subcategories by parent ID
  async getSubcategories(parentId: string): Promise<Category[]> {
    const response = await apiClient.get(`/categories/${parentId}/subcategories`);
    return response.data.data;
  }

  // Update category
  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data.data;
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  }

  // Search categories by name
  async searchCategories(name: string): Promise<Category[]> {
    const response = await apiClient.get(`/categories/search?name=${encodeURIComponent(name)}`);
    return response.data.data;
  }

  // Helper method to flatten categories for select options
  flattenCategories(categories: Category[], prefix = ''): Array<{id: string, name: string, level: number}> {
    const result: Array<{id: string, name: string, level: number}> = [];
    
    categories.forEach(category => {
      const level = (prefix.match(/└─/g) || []).length;
      result.push({
        id: category.id,
        name: prefix + category.name,
        level
      });
      
      if (category.subCategories && category.subCategories.length > 0) {
        const subResults = this.flattenCategories(
          category.subCategories, 
          prefix + '└─ '
        );
        result.push(...subResults);
      }
    });
    
    return result;
  }
}

const categoryService = new CategoryService();
export default categoryService;