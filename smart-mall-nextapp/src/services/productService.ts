import apiClient from './apiClient';

export interface ProductAttribute {
  id?: string;
  attributeName: string;
  attributeValue: string;
}

export interface ProductVariant {
  id?: string;
  sku: string;
  price: number;
  stock: number;
  weight?: number;
  dimensions?: string;
  attributes: ProductAttribute[];
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  brand: string;
  images?: string[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  variants: ProductVariant[];
  categoryId: string;
  shopId: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  shop?: {
    id: string;
    name: string;
    description: string;
    numberPhone: string;
  };
}

export interface CreateProductData {
  categoryId: string;
  shopId: string;
  name: string;
  description: string;
  brand: string;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  variants: Omit<ProductVariant, 'id'>[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  variants?: ProductVariant[];
  removedVariantIds?: string[]; // IDs of variants to be removed
}

class ProductService {
  // Create product with images
  async createProduct(productData: CreateProductData, images?: File[]): Promise<Product> {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post('/products/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Create product simple (without images)
  async createProductSimple(productData: CreateProductData): Promise<Product> {
    const response = await apiClient.post('/products/create-simple', productData);
    return response.data.data;
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  }

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products/all');
    return response.data.data;
  }

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await apiClient.get(`/products/category/${categoryId}`);
    return response.data.data;
  }

  // Get products by shop
  async getProductsByShop(shopId: string): Promise<Product[]> {
    const response = await apiClient.get(`/products/shop/${shopId}`);
    return response.data.data;
  }

  // Get products by status
  async getProductsByStatus(status: "ACTIVE" | "INACTIVE"): Promise<Product[]> {
    const response = await apiClient.get(`/products/status/${status}`);
    return response.data.data;
  }

  // Search products by name
  async searchProductsByName(name: string): Promise<Product[]> {
    const response = await apiClient.get(`/products/search?name=${encodeURIComponent(name)}`);
    return response.data.data;
  }

  // Advanced search
  async advancedSearch(params: {
    name?: string;
    brand?: string;
    categoryId?: string;
    shopId?: string;
    status?: "ACTIVE" | "INACTIVE";
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const response = await apiClient.get(`/products/advanced-search?${queryParams.toString()}`);
    return response.data.data;
  }

  /**
   * Update product using unified API: PUT /api/products/{id}
   * 
   * This single method handles all update scenarios:
   * - Data only: updateProduct(id, productData)
   * - Images only: updateProduct(id, undefined, images) or updateProduct(id, {}, images)
   * - Both: updateProduct(id, productData, images)
   * 
   * @param id - Product ID to update
   * @param productData - Product data to update (optional)
   * @param images - Array of image files (optional)
   * @returns Promise<Product> - Updated product
   */
  async updateProduct(id: string, productData?: UpdateProductData, images?: File[]): Promise<Product> {
    const formData = new FormData();
    
    // Add product data if provided
    if (productData && Object.keys(productData).length > 0) {
      formData.append('productData', JSON.stringify(productData));
    }
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    // Validate that at least one parameter is provided
    if ((!productData || Object.keys(productData).length === 0) && (!images || images.length === 0)) {
      throw new Error("Either productData or images must be provided");
    }

    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  // Get product count by shop
  async getProductCountByShop(shopId: string): Promise<number> {
    const response = await apiClient.get(`/products/count/shop/${shopId}`);
    return response.data.data;
  }

  // Get product count by category
  async getProductCountByCategory(categoryId: string): Promise<number> {
    const response = await apiClient.get(`/products/count/category/${categoryId}`);
    return response.data.data;
  }
}

const productService = new ProductService();
export default productService;