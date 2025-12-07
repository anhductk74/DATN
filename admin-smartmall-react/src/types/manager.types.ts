// Manager (API response has flat structure with company fields)
export interface Manager {
  managerId: string;
  userId: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  isActive: number; // 1 = active, 0 = inactive
  companyId: string;
  companyName: string;
  companyCode: string | null;
  companyContactEmail: string | null;
  companyContactPhone: string | null;
  companyStreet: string;
  companyCommune: string;
  companyDistrict: string;
  companyCity: string;
  companyFullAddress: string;
  createdAt: string;
  updatedAt: string;
}

// Manager Register DTO (Admin only)
export interface ManagerRegisterDto {
  // User info
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  
  // Company info
  companyName: string;
  companyCode?: string;
  companyContactEmail?: string;
  companyContactPhone?: string;
  companyStreet: string;
  companyCommune: string;
  companyDistrict: string;
  companyCity: string;
}

// Manager Register Response
export interface ManagerRegisterResponseDto {
  userId: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  companyId: string;
  companyName: string;
  companyCode: string | null;
  companyContactEmail: string | null;
  companyContactPhone: string | null;
  companyStreet: string;
  companyCommune: string;
  companyDistrict: string;
  companyCity: string;
  companyFullAddress: string;
  managerId: string;
  accessToken: string;
  refreshToken: string;
}

// Update Manager DTO
export interface UpdateManagerDto {
  fullName?: string;
  phoneNumber?: string;
  avatar?: File;
}

// Paginated Managers Response (new API format)
export interface ManagersPageResponse {
  data: Manager[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
