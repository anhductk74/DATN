// Export all services
export { default as apiClient } from './apiClient';
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as shopService } from './shopService';
export { default as productService } from './productService';
export { default as categoryService } from './categoryService';

// Export types from common types
export type * from '@/types/common';
export type { Shop, ShopAddress, CreateShopData, UpdateShopData } from './shopService';
export type { Product, ProductVariant, ProductAttribute, CreateProductData, UpdateProductData } from './productService';
export type { Category, CreateCategoryData, UpdateCategoryData } from './categoryService';

// Import services for the services object
import authService from './authService';
import userService from './userService';
import shopService from './shopService';
import productService from './productService';
import categoryService from './categoryService';

// Create a services object for easier importing
export const services = {
  auth: authService,
  user: userService,
  shop: shopService,
  product: productService,
  category: categoryService,
};

export default services;