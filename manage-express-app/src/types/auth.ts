import { DefaultSession } from "next-auth";

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
