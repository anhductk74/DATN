// Gender enum
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// User role enum
export type UserRole = 'USER' | 'ADMIN';

// User Info DTO
export interface User {
  id: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  gender: Gender | null;
  dateOfBirth: string | null; // Format: YYYY-MM-DD
  isActive: boolean;
  roles: string[];
}

// Update User Profile DTO
export interface UpdateUserProfileDto {
  fullName?: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string; // Format: YYYY-MM-DD
}

// Change Password DTO
export interface ChangePasswordDto {
  currentPassword?: string; // Optional for OAuth users
  newPassword: string;
  confirmPassword: string;
}

// Paginated Users Response
export interface UsersPageResponse {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// User Statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}
