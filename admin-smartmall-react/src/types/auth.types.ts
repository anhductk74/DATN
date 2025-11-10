export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  isActive: number;
  roles: string[];
}

export interface AuthResponse {
  status: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userInfo: UserInfo;
  };
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  data: null;
}
