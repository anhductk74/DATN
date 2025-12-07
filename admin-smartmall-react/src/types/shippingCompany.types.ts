// Shipping Company Address
export interface ShippingCompanyAddress {
  street: string;
  commune: string;
  district: string;
  city: string;
}

// Shipping Company
export interface ShippingCompany {
  id: string;
  name: string;
  code: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  headquartersAddress: ShippingCompanyAddress;
  fullAddress: string;
  createdAt: string;
  updatedAt: string;
}

// Create/Update Shipping Company DTO (for future use)
export interface ShippingCompanyDto {
  name: string;
  code?: string;
  contactEmail?: string;
  contactPhone?: string;
  street: string;
  commune: string;
  district: string;
  city: string;
}
