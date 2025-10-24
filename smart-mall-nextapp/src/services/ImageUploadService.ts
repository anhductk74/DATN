import apiClient from "@/lib/apiClient";

export interface UploadImageResponse {
  url: string;
  path: string;
}

export class ImageUploadService {
  /**
   * Upload single image to backend API
   * @param file - Image file to upload
   * @returns Promise with image URL
   */
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadImageResponse>(
      "/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Return full URL from response
    return response.data.url;
  }

  /**
   * Upload multiple images to backend API
   * @param files - Array of image files to upload
   * @returns Promise with array of image URLs
   */
  static async uploadImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Validate image file
   * @param file - File to validate
   * @returns true if valid, false otherwise
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)",
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Kích thước ảnh không được vượt quá 5MB",
      };
    }

    return { valid: true };
  }
}
