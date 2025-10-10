// Cloudinary base URL - API trả về path dạng: /dadr6xuhc/image/upload/...
// Chỉ cần base URL, không cần cloud name vì API đã include
export const CLOUDINARY_API_URL = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL || 'https://res.cloudinary.com';

// Helper function to build full Cloudinary URL
export const getCloudinaryUrl = (path: string): string => {
  if (!path) return '';
  
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