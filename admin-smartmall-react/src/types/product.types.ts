export interface ProductVariantAttribute {
  id: string;
  attributeName: string;
  attributeValue: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  weight: number;
  dimensions: string;
  productName: string;
  productBrand: string;
  attributes: ProductVariantAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  numberPhone: string;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isDeleted: boolean;
  category: Category;
  shop: Shop;
  variants: ProductVariant[];
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsPageResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ProductApiResponse {
  success: boolean;
  message: string;
  data: ProductsPageResponse;
}

export interface ProductDetailApiResponse {
  success: boolean;
  message: string;
  data: Product;
}
