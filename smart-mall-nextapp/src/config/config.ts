// Cloudinary base URL - API trả về path dạng: /dadr6xuhc/image/upload/...
// Chỉ cần base URL, không cần cloud name vì API đã include
export const CLOUDINARY_API_URL = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL || 'https://res.cloudinary.com';

// API Base URL for WebSocket and REST API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

// Default placeholder image (data URI - simple gray box with "No Image" text)
export const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';

// Helper function to build full Cloudinary URL
export const getCloudinaryUrl = (path: string): string => {
  if (!path) return DEFAULT_PRODUCT_IMAGE;
  
  // Nếu đã là URL đầy đủ, return luôn
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // API trả về path dạng: /dadr6xuhc/image/upload/... hoặc dadr6xuhc/image/upload/...
  // Loại bỏ tất cả slashes thừa và ghép lại
  const cleanBase = CLOUDINARY_API_URL.replace(/\/+$/, ''); // Remove all trailing slashes
  const cleanPath = path.replace(/^\/+/, ''); // Remove all leading slashes
  
  const finalUrl = `${cleanBase}/${cleanPath}`;
  
  // Fix any double slashes in the middle (except after http:// or https://)
  return finalUrl.replace(/([^:]\/)\/+/g, '$1');
};