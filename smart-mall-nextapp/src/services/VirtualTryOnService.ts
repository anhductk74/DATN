/**
 * Service để tương tác với Fashion AI API (Gemini)
 * Base URL: http://localhost:5001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_URL_PYTHON || 'http://localhost:5001';

export interface ExtractGarmentRequest {
  garmentImage: File;
  garmentType: 'shirt' | 'pants' | 'shoes' | 'hat' | 'dress' | 'jacket' | 'skirt' | 'accessories';
  customPrompt?: string;
}

export interface ExtractGarmentResponse {
  success: boolean;
  garment_type?: string;
  extracted_image_path?: string;
  custom_prompt_used?: string;
  image_base64?: string;
  error?: string;
}

export interface ExtractedGarment {
  type: string;
  name: string;
  image_base64: string;
}

export interface MixOutfitRequest {
  modelImage: File;
  extractedFiles: { type: string; file: Blob }[];
}

export interface MixOutfitResponse {
  success: boolean;
  image_path?: string;
  applied_items?: Array<{ type: string; name: string }>;
  image_base64?: string;
  error?: string;
}

export class VirtualTryOnService {
  /**
   * API 1: Tách trang phục từ ảnh
   */
  static async extractGarment(request: ExtractGarmentRequest): Promise<ExtractGarmentResponse> {
    const formData = new FormData();
    formData.append('garment_image', request.garmentImage);
    formData.append('garment_type', request.garmentType);
    if (request.customPrompt) {
      formData.append('custom_prompt', request.customPrompt);
    }

    const response = await fetch(`${API_BASE_URL}/ai_extract_garment`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * API 2: Ghép trang phục vào người mẫu (Direct Upload Method)
   * 🎯 GIỮ NGUYÊN 100% MODEL GỐC - CHỈ THAY OUTFIT
   */
  static async mixOutfit(request: MixOutfitRequest): Promise<MixOutfitResponse> {
    const formData = new FormData();
    formData.append('model_image', request.modelImage);

    request.extractedFiles.forEach(({ type, file }) => {
      formData.append(`${type}_extracted`, file, `${type}_extracted.png`);
    });

    console.log('🎨 Mixing outfit:', {
      model: request.modelImage.name,
      items: request.extractedFiles.length,
      details: request.extractedFiles.map(g => `${g.type} (${(g.file.size / 1024).toFixed(1)}KB)`)
    });

    const response = await fetch(`${API_BASE_URL}/ai_mix_outfit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ Mix failed:', errorData);
      throw new Error(errorData.error || `${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Mix successful!');
    return result;
  }

  /**
   * Helper: Convert base64 to Blob
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

  /**
   * Helper: Convert File to base64
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Helper: Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPG, PNG, or WEBP image.',
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum 10MB allowed.',
      };
    }

    return { valid: true };
  }
}
