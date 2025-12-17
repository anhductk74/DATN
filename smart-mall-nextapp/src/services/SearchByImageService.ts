/**
 * Service for AI Search by Image API
 * Base URL: http://localhost:5001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_URL_PYTHON || 'http://localhost:5001';

export interface SearchAnalysis {
  product_type: string;
  category?: string;
  brand?: string;
  color?: string;
  key_features?: string[];
  style?: string;
  material?: string;
  price_range?: string;
  search_keywords?: string[];
}

export interface ProductMatch {
  id: string;
  name: string;
  image: string;
  minPrice: number;
  maxPrice: number;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  shopName?: string;
  category?: string;
  link: string;
  matchScore: number;
  matchReasons: string[];
}

export interface SearchByImageResponse {
  success: boolean;
  search_analysis?: SearchAnalysis;
  total_matches?: number;
  products?: ProductMatch[];
  timestamp?: string;
  error?: string;
}

export interface SearchByImageRequest {
  searchImage: Blob | File;
  maxResults?: number;
  categoryFilter?: string;
}

export class SearchByImageService {
  /**
   * Search for similar products using image
   */
  static async searchByImage(request: SearchByImageRequest): Promise<SearchByImageResponse> {
    const formData = new FormData();
    formData.append('search_image', request.searchImage);
    
    if (request.maxResults) {
      formData.append('max_results', request.maxResults.toString());
    }
    
    if (request.categoryFilter) {
      formData.append('category_filter', request.categoryFilter);
    }

    console.log('🔍 Searching products by image...', {
      size: request.searchImage.size,
      type: request.searchImage.type,
      maxResults: request.maxResults,
      category: request.categoryFilter
    });

    try {
      const response = await fetch(`${API_BASE_URL}/ai_search_by_image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Search completed:', {
        success: result.success,
        total_matches: result.total_matches,
        products_count: result.products?.length,
        analysis: result.search_analysis,
        full_response: result
      });
      
      return result;
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert base64 to Blob for searching
   */
  static base64ToBlob(base64: string): Blob {
    const parts = base64.split(',');
    const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64Data = parts[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
