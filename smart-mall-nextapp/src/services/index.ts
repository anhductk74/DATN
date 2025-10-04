// Export all services
export { default as apiClient } from './apiClient';
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as shopService } from './shopService';

// Export types from common types
export type * from '@/types/common';
export type { Shop, ShopAddress, CreateShopData, UpdateShopData } from './shopService';

// Import services for the services object
import authService from './authService';
import userService from './userService';
import shopService from './shopService';

// Create a services object for easier importing
export const services = {
  auth: authService,
  user: userService,
  shop: shopService,
};

export default services;