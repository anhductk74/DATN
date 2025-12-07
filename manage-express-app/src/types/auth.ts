import { DefaultSession } from "next-auth";

// Company information interface
export interface CompanyInfo {
  companyId: string;
  companyName: string;
  companyCode: string;
  contactEmail: string;
  contactPhone: string;
  street: string;
  commune: string;
  district: string;
  city: string;
  fullAddress: string;
}

// Authentication related types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      username?: string;
      fullName?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      avatar?: string;
      isActive?: boolean;
      roles?: string[];
      company?: CompanyInfo;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username?: string;
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    isActive?: boolean;
    roles?: string[];
    accessToken?: string;
    refreshToken?: string;
    company?: CompanyInfo;
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
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    isActive?: boolean;
    roles?: string[];
    company?: CompanyInfo;
  }
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface UserInfoDto {
  id: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: number;
  roles: string[];
  company?: CompanyInfo;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfoDto;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface GoogleUserData {
  idToken: string;
}
