export interface LoginRequest {
  username: string;
  password: string;
}

export interface ShipperInfo {
  shipperId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BUSY';
  vehicleType: 'MOTORBIKE' | 'CAR' | 'TRUCK' | 'BICYCLE';
  licensePlate: string;
  vehicleBrand: string;
  vehicleColor: string;
  currentLatitude: number;
  currentLongitude: number;
  maxDeliveryRadius: number;
  operationalCommune: string;
  operationalDistrict: string;
  operationalCity: string;
  operationalRegionFull: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
}

export interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  avatar: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  isActive: number;
  roles: string[];
  shipper: ShipperInfo | null;
  company: any | null;
}

export interface LoginResponse {
  status: 'SUCCESS' | 'ERROR' | number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userInfo: UserInfo;
  } | null;
}
