// Auth Types
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfoDto;
}

export interface UserInfoDto {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  isActive: number;
  roles: string[];
}

export interface GoogleUserData {
  idToken: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

// User Types
export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  addresses?: Address[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
