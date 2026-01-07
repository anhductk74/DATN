import apiClient from '../lib/apiClient';

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
  // Flash Sale fields (as per FLASH_SALE_API_README.md)
  flashSalePrice?: number;         // Giá flash sale, null nếu không có
  flashSaleStartTime?: string;     // ISO format: "YYYY-MM-DDTHH:mm:ss"
  flashSaleEndTime?: string;       // ISO format: "YYYY-MM-DDTHH:mm:ss"
  flashSaleQuantity?: number;      // Số lượng sản phẩm dành cho flash sale (optional, min: 1)
  isFlashSaleActive?: boolean;     // Auto-calculated: now >= startTime && now < endTime
  discountPercent?: number;        // Auto-calculated: ((price - flashSalePrice) / price) * 100
  timeUntilFlashSale?: number;     // Seconds until flash sale starts (null if already started)
  // Product info (from shop flash sales endpoint enrichment)
  productId?: string;              // Product ID this variant belongs to
  productName?: string;            // Product name for display
  productBrand?: string;           // Product brand for display
  productImages?: string[];        // Product images for display
}

// Flash Sale Product DTO (as per FLASH_SALE_API_README.md)
export interface FlashSaleProductDto {
  productId: string;
  productName: string;
  productBrand: string;
  productImage: string;  // Changed from productImages[] to single productImage
  variantId: string;
  variantSku: string;
  originalPrice: number;
  flashSalePrice: number;
  discountPercent: number;
  stock: number;
  flashSaleQuantity?: number;  // Số lượng giới hạn cho flash sale (optional)
  flashSaleStartTime: string;
  flashSaleEndTime: string;
  isFlashSaleActive: boolean;
  timeRemaining: number; // seconds until end
  shopId?: string; // Added to filter by shop
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  brand: string;
  images?: string[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  isDeleted?: boolean; // Soft delete flag
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
    avatar?: string; // Added avatar field to match API response
    ownerId?: string;
    ownerName?: string;
    address?: string;
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

  // Soft delete product (mark as deleted)
  async softDeleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}/soft`);
  }

  // Restore deleted product
  async restoreProduct(id: string): Promise<void> {
    await apiClient.put(`/products/${id}/restore`);
  }

  // Hard delete product (permanent deletion)
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  // Get all products including deleted ones
  async getAllProductsIncludingDeleted(): Promise<Product[]> {
    const response = await apiClient.get('/products/all/including-deleted');
    return response.data.data;
  }

  // Get only deleted products
  async getDeletedProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products/deleted');
    return response.data.data;
  }

  // Get product by ID including deleted
  async getProductByIdIncludingDeleted(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}/including-deleted`);
    return response.data.data;
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

  // ================= FLASH SALE OPERATIONS =================
  
  // Set flash sale for a product variant
  // Endpoint: PUT /api/products/variants/{variantId}/flash-sale
  // Request body: { flashSalePrice, startTime, endTime, flashSaleQuantity (optional) }
  async setFlashSale(
    variantId: string,
    data: {
      flashSalePrice: number;
      startTime: string;           // Format: "YYYY-MM-DDTHH:mm:ss" (ISO 8601)
      endTime: string;             // Format: "YYYY-MM-DDTHH:mm:ss" (ISO 8601)
      flashSaleQuantity?: number;  // Optional: Số lượng giới hạn cho flash sale (min: 1)
    }
  ): Promise<ProductVariant> {
    const response = await apiClient.put(`/products/variants/${variantId}/flash-sale`, data);
    return response.data.data;
  }

  // Remove flash sale from a product variant
  async removeFlashSale(variantId: string): Promise<void> {
    await apiClient.delete(`/products/variants/${variantId}/flash-sale`);
  }

  // Get active flash sale products
  async getActiveFlashSaleProducts(page: number = 0, size: number = 20): Promise<{
    content: FlashSaleProductDto[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await apiClient.get(`/products/flash-sales/active?page=${page}&size=${size}`);
    return response.data.data;
  }

  // Get upcoming flash sale products
  async getUpcomingFlashSaleProducts(page: number = 0, size: number = 20): Promise<{
    content: FlashSaleProductDto[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await apiClient.get(`/products/flash-sales/upcoming?page=${page}&size=${size}`);
    return response.data.data;
  }

  // Get flash sale products by shop (NEW: As per updated docs)
  // Endpoint: GET /api/products/shops/{shopId}/flash-sales
  async getShopFlashSales(shopId: string, page: number = 0, size: number = 20): Promise<{
    content: ProductVariant[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await apiClient.get(`/products/shops/${shopId}/flash-sales?page=${page}&size=${size}`);
    return response.data.data;
  }

  // Get ALL flash sale products by shop (including upcoming, active, expired) - for management
  // Endpoint: GET /api/products/shops/{shopId}/flash-sales/all
  async getAllShopFlashSales(shopId: string, page: number = 0, size: number = 20): Promise<{
    content: ProductVariant[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await apiClient.get(`/products/shops/${shopId}/flash-sales/all?page=${page}&size=${size}`);
    return response.data.data;
  }
}

const productService = new ProductService();
export default productService;