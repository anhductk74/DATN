// Location service for Vietnam provinces, districts, and wards
export interface Province {
  code?: number;  // API trả về code dạng số
  codename?: string;
  division_type?: string;
  phone_code?: number;
  name: string;
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
}

export interface District {
  code?: number;
  codename?: string;
  division_type?: string;
  name: string;
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
  province_code?: string;
}

export interface Ward {
  code?: number;
  codename?: string;
  division_type?: string;
  name: string;
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
  district_code?: string;
}

export interface LocationResponse<T> {
  results?: T[];
}

class LocationService {
  private baseUrl = 'https://provinces.open-api.vn/api/v1';

  // Fetch all provinces
  async getProvinces(): Promise<Province[]> {
    try {
      console.log('Fetching provinces from:', `${this.baseUrl}/p/`);
      const response = await fetch(`${this.baseUrl}/p/`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // API trả về array trực tiếp, không có results wrapper
      const provinces = Array.isArray(data) ? data : data.results || [];
      console.log('Processed provinces:', provinces.length);
      
      return provinces;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error; // Re-throw để component có thể handle
    }
  }

  // Fetch districts by province code
  async getDistricts(provinceCode: number | string): Promise<District[]> {
    try {
      console.log('Fetching districts for province:', provinceCode);
      const response = await fetch(`${this.baseUrl}/p/${provinceCode}?depth=2`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Districts response:', data);
      
      const districts = data.districts || [];
      console.log('Processed districts:', districts.length);
      
      return districts;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  // Fetch wards by district code
  async getWards(districtCode: number | string): Promise<Ward[]> {
    try {
      console.log('Fetching wards for district:', districtCode);
      const response = await fetch(`${this.baseUrl}/d/${districtCode}?depth=2`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Wards response:', data);
      
      const wards = data.wards || [];
      console.log('Processed wards:', wards.length);
      
      return wards;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }

  // Get province by code
  async getProvinceByCode(code: string): Promise<Province | null> {
    try {
      const response = await fetch(`${this.baseUrl}/p/${code}`);
      if (!response.ok) {
        throw new Error('Failed to fetch province');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching province:', error);
      return null;
    }
  }

  // Get district by code
  async getDistrictByCode(code: string): Promise<District | null> {
    try {
      const response = await fetch(`${this.baseUrl}/d/${code}`);
      if (!response.ok) {
        throw new Error('Failed to fetch district');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching district:', error);
      return null;
    }
  }

  // Get ward by code
  async getWardByCode(code: string): Promise<Ward | null> {
    try {
      const response = await fetch(`${this.baseUrl}/w/${code}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ward');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ward:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();