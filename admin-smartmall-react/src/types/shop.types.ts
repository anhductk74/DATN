// Shop Address
export interface ShopAddress {
  street: string;
  ward: string;
  district: string;
  province: string;
  country: string;
}

// Shop Response DTO
export interface Shop {
  id: string;
  name: string;
  cccd: string;
  description: string;
  numberPhone: string;
  avatar: string;
  ownerId: string;
  ownerName: string;
  viewCount: number;
  address: ShopAddress;
}

// Create Shop DTO
export interface CreateShopDto {
  name: string;
  cccd: string;
  description: string;
  phoneNumber: string;
  ownerId: string;
  address: ShopAddress;
}

// Update Shop DTO
export interface UpdateShopDto {
  name?: string;
  cccd?: string;
  description?: string;
  phoneNumber?: string;
  ownerId?: string;
  address?: ShopAddress;
}

// Paginated Shops Response
export interface ShopsPageResponse {
  content: Shop[];
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

// Shop Statistics
export interface ShopStats {
  totalShops: number;
  totalViews: number;
  averageViewsPerShop: number;
}
