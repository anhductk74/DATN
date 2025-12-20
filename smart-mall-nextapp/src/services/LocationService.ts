// Location service for Vietnam provinces, districts, and wards
// Using static data instead of API to avoid external dependency

import provincesData from '@/data/tinh_tp.json';
import districtsData from '@/data/quan_huyen.json';
import wardsData from '@/data/xa_phuong.json';

export interface Province {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  // For backward compatibility
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
}

export interface District {
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  parent_code: string;
  // For backward compatibility
  province_code?: string | number;
  division_type?: string;
  codename?: string;
  wards?: Ward[];
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
}

export interface Ward {
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  parent_code: string;
  // For backward compatibility
  district_code?: string | number;
  division_type?: string;
  codename?: string;
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
}

export interface LocationResponse<T> {
  results?: T[];
}

class LocationService {
  // Static data loaded from JSON files
  private provincesMap: Record<string, Province> = provincesData as Record<string, Province>;
  private districtsMap: Record<string, District> = districtsData as Record<string, District>;
  private wardsMap: Record<string, Ward> = wardsData as Record<string, Ward>;

  // Convert map to array
  private get provinces(): Province[] {
    return Object.values(this.provincesMap);
  }

  private get districts(): District[] {
    return Object.values(this.districtsMap);
  }

  private get wards(): Ward[] {
    return Object.values(this.wardsMap);
  }

  // Fetch all provinces from static data
  async getProvinces(): Promise<Province[]> {
    try {
      console.log('Loading provinces from static data...');
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      const provinceList = this.provinces;
      console.log('Provinces loaded:', provinceList.length);
      return provinceList;
    } catch (error) {
      console.error('Error loading provinces:', error);
      throw error;
    }
  }

  // Fetch districts by province code from static data
  async getDistricts(provinceCode: string): Promise<District[]> {
    try {
      console.log('Loading districts for province:', provinceCode);
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Filter districts by parent_code (province code)
      const filteredDistricts = this.districts.filter(
        district => district.parent_code === provinceCode
      );
      
      console.log('Districts loaded:', filteredDistricts.length);
      return filteredDistricts;
    } catch (error) {
      console.error('Error loading districts:', error);
      throw error;
    }
  }

  // Fetch wards by district code from static data
  async getWards(districtCode: string): Promise<Ward[]> {
    try {
      console.log('Loading wards for district:', districtCode);
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Filter wards by parent_code (district code)
      const filteredWards = this.wards.filter(
        ward => ward.parent_code === districtCode
      );
      
      console.log('Wards loaded:', filteredWards.length);
      return filteredWards;
    } catch (error) {
      console.error('Error loading wards:', error);
      throw error;
    }
  }

  // Get province by code from static data
  // Get province by code from static data
  async getProvinceByCode(code: string): Promise<Province | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const province = this.provincesMap[code] || null;
      return province;
    } catch (error) {
      console.error('Error loading province:', error);
      return null;
    }
  }

  // Get district by code from static data
  async getDistrictByCode(code: string): Promise<District | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const district = this.districtsMap[code] || null;
      return district;
    } catch (error) {
      console.error('Error loading district:', error);
      return null;
    }
  }

  // Get ward by code from static data
  async getWardByCode(code: string): Promise<Ward | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const ward = this.wardsMap[code] || null;
      return ward;
    } catch (error) {
      console.error('Error loading ward:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();