import { DefaultSession } from "next-auth";

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      username?: string;
      fullName?: string;
      phoneNumber?: string;
      avatar?: string;
      isActive?: boolean;
      roles?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username?: string;
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
    isActive?: boolean;
    roles?: string[];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    username?: string;
    fullName?: string;
    phoneNumber?: string;
    isActive?: boolean;
    roles?: string[];
  }
}

// API Response Types
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
  isActive: number; // API returns 0/1, convert to boolean when needed
  roles: string[];
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface GoogleUserData {
  idToken: string;
}