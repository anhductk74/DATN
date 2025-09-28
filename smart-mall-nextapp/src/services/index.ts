// Export all services
export { default as apiClient } from './apiClient';
export { default as authService } from './authService';
export { default as userService } from './userService';

// Export types from common types
export type * from '@/types/common';

// Import services for the services object
import authService from './authService';
import userService from './userService';

// Create a services object for easier importing
export const services = {
  auth: authService,
  user: userService,
};

export default services;