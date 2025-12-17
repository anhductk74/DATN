import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===============================
// DTO Shipper
// ===============================

export interface ShipperResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  avatar: string | null;
  gender: string;
  dateOfBirth: string | null;

  status: string;

  currentLatitude?: number;
  currentLongitude?: number;

  vehicleType?: string;
  licensePlate?: string;
  vehicleBrand?: string;
  vehicleColor?: string;

  operationalCommune?: string;
  operationalDistrict?: string;
  operationalCity?: string;
  operationalRegionFull?: string;
  maxDeliveryRadius?: number;

  idCardNumber?: string;
  idCardFrontImage?: string | null;
  idCardBackImage?: string | null;
  driverLicenseNumber?: string;
  driverLicenseImage?: string | null;

  shippingCompanyId?: string;
  shippingCompanyName?: string;

  userId?: string;
  username?: string;

  address?: string;
}

export interface ShipperUpdateDto {
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
  vehicleType?: string;
  licensePlate?: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  operationalCommune?: string;
  operationalDistrict?: string;
  operationalCity?: string;
  maxDeliveryRadius?: number;
  idCardNumber?: string;
  driverLicenseNumber?: string;
}

// ===============================
// API Response
// ===============================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

// ===============================
// SERVICE
// ===============================

class ShipperService {
  private async getAuthHeaders() {
    let token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      token = await AsyncStorage.getItem("@smartmall_access_token");
    }
    console.log('ShipperService - Token exists:', !!token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    return {
      success: response.data?.success ?? response.status < 300,
      message: response.data?.message ?? "Success",
      data: response.data?.data ?? response.data
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "An error occurred",
      data: null
    };
  }

  // ===============================
  // GET BY ID
  // GET /api/logistics/shippers/{id}
  // ===============================

  async getById(id: string): Promise<ApiResponse<ShipperResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shippers/${id}`,
        { headers }
      );

      return this.handleResponse<ShipperResponseDto>(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // ===============================
  // UPDATE SHIPPER
  // PUT /api/logistics/shippers/{id}
  // ===============================

async updateShipper(
  id: string,
  dto: ShipperUpdateDto,
  images?: {
    idCardFront?: string;
    idCardBack?: string;
    driverLicense?: string;
  }
): Promise<ApiResponse<ShipperResponseDto>> {
  try {
    const headers = await this.getAuthHeaders();
    const formData = new FormData();

    // append dto
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // append images (nếu có)
    if (images?.idCardFront) {
      formData.append('idCardFront', {
        uri: images.idCardFront,
        name: 'idCardFront.jpg',
        type: 'image/jpeg',
      } as any);
    }

    if (images?.idCardBack) {
      formData.append('idCardBack', {
        uri: images.idCardBack,
        name: 'idCardBack.jpg',
        type: 'image/jpeg',
      } as any);
    }

    if (images?.driverLicense) {
      formData.append('driverLicense', {
        uri: images.driverLicense,
        name: 'driverLicense.jpg',
        type: 'image/jpeg',
      } as any);
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/logistics/shippers/${id}`,
      formData,
      {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return this.handleResponse(response);
  } catch (err) {
    return this.handleError(err);
  }
}

  // ===============================
  // UPDATE SHIPPER WITH IMAGES
  // PUT /api/logistics/shippers/{id} (multipart/form-data)
  // ===============================
  // async updateShipperWithImages(
  //   id: string,
  //   dto: ShipperUpdateDto,
  //   images?: {
  //     idCardFront?: string;
  //     idCardBack?: string;
  //     driverLicense?: string;
  //   }
  // ): Promise<ApiResponse<ShipperResponseDto>> {
  //   try {
  //     const headers = await this.getAuthHeaders();
  //     const formData = new FormData();

  //     // Append DTO fields
  //     Object.keys(dto).forEach(key => {
  //       const value = (dto as any)[key];
  //       if (value !== undefined && value !== null) {
  //         formData.append(key, value.toString());
  //       }
  //     });

  //     // Append image files if provided
  //     if (images?.idCardFront) {
  //       const filename = images.idCardFront.split('/').pop() || 'idCardFront.jpg';
  //       const match = /\.(\w+)$/.exec(filename);
  //       const type = match ? `image/${match[1]}` : 'image/jpeg';
        
  //       formData.append('idCardFront', {
  //         uri: images.idCardFront,
  //         name: filename,
  //         type: type,
  //       } as any);
  //     }

  //     if (images?.idCardBack) {
  //       const filename = images.idCardBack.split('/').pop() || 'idCardBack.jpg';
  //       const match = /\.(\w+)$/.exec(filename);
  //       const type = match ? `image/${match[1]}` : 'image/jpeg';
        
  //       formData.append('idCardBack', {
  //         uri: images.idCardBack,
  //         name: filename,
  //         type: type,
  //       } as any);
  //     }

  //     if (images?.driverLicense) {
  //       const filename = images.driverLicense.split('/').pop() || 'driverLicense.jpg';
  //       const match = /\.(\w+)$/.exec(filename);
  //       const type = match ? `image/${match[1]}` : 'image/jpeg';
        
  //       formData.append('driverLicense', {
  //         uri: images.driverLicense,
  //         name: filename,
  //         type: type,
  //       } as any);
  //     }

  //     console.log('Updating shipper with FormData:', { id, hasImages: !!images });

  //     const response = await axios.put(
  //       `${API_BASE_URL}/api/logistics/shippers/${id}`,
  //       formData,
  //       {
  //         headers: {
  //           ...headers,
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );

  //     return this.handleResponse<ShipperResponseDto>(response);
  //   } catch (err: any) {
  //     console.error('Update error:', err?.response?.data || err?.message);
  //     return this.handleError(err);
  //   }
  // }
}

// Export instance
export const shipperService = new ShipperService();
