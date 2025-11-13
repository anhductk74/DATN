export interface Brand {
  name: string;
  productCount: number;
  totalProducts?: number;
}

export interface BrandStats {
  brands: Brand[];
  totalBrands: number;
}
