import apiClient from '../lib/apiClient';

export interface ShippingCompanyStatus {
  ACTIVE: 'ACTIVE';
  INACTIVE: 'INACTIVE';
  SUSPENDED: 'SUSPENDED';
}

export interface ShipperResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  status: string;
  currentLatitude?: number;
  currentLongitude?: number;
  vehicleType: string;
  licensePlate: string;
  operationalCommune: string;
  operationalDistrict: string;
  operationalCity: string;
  operationalRegionFull: string;
  maxDeliveryRadius?: number;
  idCardNumber?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;
  driverLicenseNumber?: string;
  driverLicenseImage?: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
  userId: string;
  username: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseResponseDto {
  id: string;
  name: string;
  address: string;
  region: string;
  managerName: string;
  phone: string;
  status: string;
  province?: string;
  district?: string;
  ward?: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
}

export interface ShippingCompanyListDto {
  id: string; // Backend trả UUID dưới dạng string trong JSON
  name: string;
  code: string;
  status: string; // Backend trả "ACTIVE", "INACTIVE", "SUSPENDED" - không phải keyof
  headquartersAddress?: string; // Địa chỉ trụ sở chính
  district?: string; // Quận/Huyện của công ty
  city?: string; // Tỉnh/Thành phố của công ty
}

export interface ShippingCompanyRequestDto {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  headquartersAddress: string;
  status: string; // Backend nhận ShippingCompanyStatus enum
}

export interface ShippingCompanyResponseDto {
  id: string; // UUID trả về dưới dạng string
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  headquartersAddress: string;
  status: string; // Backend trả enum dưới dạng string
  district?: string; // Quận/Huyện - khu vực hoạt động của công ty
  city?: string; // Tỉnh/Thành phố
  shippers?: ShipperResponseDto[];
  warehouses?: WarehouseResponseDto[];
}

export class ShippingCompanyService {
  private static readonly BASE_URL = '/logistics/shipping-companies';

  // Tạo mới shipping company
  static async create(dto: ShippingCompanyRequestDto): Promise<ShippingCompanyResponseDto> {
    const response = await apiClient.post<ShippingCompanyResponseDto>(
      this.BASE_URL,
      dto
    );
    return response.data;
  }

  // Cập nhật shipping company
  static async update(
    id: string,
    dto: ShippingCompanyRequestDto
  ): Promise<ShippingCompanyResponseDto> {
    const response = await apiClient.put<ShippingCompanyResponseDto>(
      `${this.BASE_URL}/${id}`,
      dto
    );
    return response.data;
  }

  // Danh sách tất cả shipping companies
  static async getAll(): Promise<ShippingCompanyListDto[]> {
    const response = await apiClient.get<ShippingCompanyListDto[]>(this.BASE_URL);
    return response.data;
  }

  // Tìm kiếm theo tên
  static async searchByName(name: string): Promise<ShippingCompanyListDto[]> {
    const response = await apiClient.get<ShippingCompanyListDto[]>(
      `${this.BASE_URL}/search`,
      {
        params: { name }
      }
    );
    return response.data;
  }

  // Lấy chi tiết theo ID
  static async getById(id: string): Promise<ShippingCompanyResponseDto> {
    const response = await apiClient.get<ShippingCompanyResponseDto>(
      `${this.BASE_URL}/${id}`
    );
    return response.data;
  }

  // Xóa shipping company
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  // Lấy danh sách shipping companies đang hoạt động
  static async getActiveCompanies(): Promise<ShippingCompanyListDto[]> {
    const companies = await this.getAll();
    return companies.filter(company => company.status === 'ACTIVE');
  }

  // Kiểm tra code có tồn tại không (để validate khi tạo mới)
  static async checkCodeExists(code: string): Promise<boolean> {
    try {
      const companies = await this.getAll();
      return companies.some(company => company.code === code);
    } catch (error) {
      console.error('Error checking code existence:', error);
      return false;
    }
  }
}

export default ShippingCompanyService;