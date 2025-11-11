// Cloudinary base URL - API trả về path dạng: /dadr6xuhc/image/upload/...
// Chỉ cần base URL, không cần cloud name vì API đã include
export const CLOUDINARY_API_URL = import.meta.env.VITE_CLOUDINARY_API_URL || 'https://res.cloudinary.com';

// Default placeholder image (data URI - simple gray box with "No Image" text)
export const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';

// Helper function to build full Cloudinary URL
export const getCloudinaryUrl = (path: string): string => {
  if (!path) return DEFAULT_PRODUCT_IMAGE;
  
  // Nếu đã là URL đầy đủ, return luôn
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // API trả về path dạng: /dadr6xuhc/image/upload/...
  // Ghép với base URL
  const cleanBase = CLOUDINARY_API_URL.endsWith('/') 
    ? CLOUDINARY_API_URL.slice(0, -1) 
    : CLOUDINARY_API_URL;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};