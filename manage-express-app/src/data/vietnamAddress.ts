export interface Ward {
  name: string;
  code: string;
}

export interface District {
  name: string;
  code: string;
  wards: Ward[];
}

export interface City {
  name: string;
  code: string;
  districts: District[];
}

// 63 tỉnh thành Việt Nam - Chi tiết cho các thành phố lớn
export const vietnamCities: City[] = [
  // 1. HÀ NỘI
  {
    name: "Hà Nội",
    code: "01",
    districts: [
      {
        name: "Quận Ba Đình",
        code: "001",
        wards: [
          { name: "Phường Cống Vị", code: "00001" },
          { name: "Phường Điện Biên", code: "00002" },
          { name: "Phường Đội Cấn", code: "00003" },
          { name: "Phường Giảng Võ", code: "00004" },
          { name: "Phường Kim Mã", code: "00005" },
          { name: "Phường Liễu Giai", code: "00006" },
          { name: "Phường Ngọc Hà", code: "00007" },
          { name: "Phường Ngọc Khánh", code: "00008" },
          { name: "Phường Nguyễn Trung Trực", code: "00009" },
          { name: "Phường Phúc Xá", code: "00010" },
          { name: "Phường Quán Thánh", code: "00011" },
          { name: "Phường Thành Công", code: "00012" },
          { name: "Phường Trúc Bạch", code: "00013" },
          { name: "Phường Vĩnh Phúc", code: "00014" }
        ]
      },
      {
        name: "Quận Hoàn Kiếm",
        code: "002",
        wards: [
          { name: "Phường Chương Dương", code: "00015" },
          { name: "Phường Cửa Đông", code: "00016" },
          { name: "Phường Cửa Nam", code: "00017" },
          { name: "Phường Đồng Xuân", code: "00018" },
          { name: "Phường Hàng Bạc", code: "00019" },
          { name: "Phường Hàng Bài", code: "00020" },
          { name: "Phường Hàng Bồ", code: "00021" },
          { name: "Phường Hàng Bông", code: "00022" },
          { name: "Phường Hàng Buồm", code: "00023" },
          { name: "Phường Hàng Đào", code: "00024" },
          { name: "Phường Hàng Gai", code: "00025" },
          { name: "Phường Hàng Mã", code: "00026" },
          { name: "Phường Hàng Trống", code: "00027" },
          { name: "Phường Lý Thái Tổ", code: "00028" },
          { name: "Phường Phan Chu Trinh", code: "00029" },
          { name: "Phường Phúc Tân", code: "00030" },
          { name: "Phường Tràng Tiền", code: "00031" },
          { name: "Phường Trần Hưng Đạo", code: "00032" }
        ]
      },
      {
        name: "Quận Tây Hồ",
        code: "003",
        wards: [
          { name: "Phường Bưởi", code: "00033" },
          { name: "Phường Nhật Tân", code: "00034" },
          { name: "Phường Phú Thượng", code: "00035" },
          { name: "Phường Quảng An", code: "00036" },
          { name: "Phường Thụy Khuê", code: "00037" },
          { name: "Phường Tứ Liên", code: "00038" },
          { name: "Phường Xuân La", code: "00039" },
          { name: "Phường Yên Phụ", code: "00040" }
        ]
      },
      {
        name: "Quận Long Biên",
        code: "004",
        wards: [
          { name: "Phường Bồ Đề", code: "00041" },
          { name: "Phường Cự Khối", code: "00042" },
          { name: "Phường Đức Giang", code: "00043" },
          { name: "Phường Gia Thụy", code: "00044" },
          { name: "Phường Giang Biên", code: "00045" },
          { name: "Phường Long Biên", code: "00046" },
          { name: "Phường Ngọc Lâm", code: "00047" },
          { name: "Phường Ngọc Thụy", code: "00048" },
          { name: "Phường Phúc Đồng", code: "00049" },
          { name: "Phường Phúc Lợi", code: "00050" },
          { name: "Phường Sài Đồng", code: "00051" },
          { name: "Phường Thạch Bàn", code: "00052" },
          { name: "Phường Thượng Thanh", code: "00053" },
          { name: "Phường Việt Hưng", code: "00054" }
        ]
      },
      {
        name: "Quận Cầu Giấy",
        code: "005",
        wards: [
          { name: "Phường Dịch Vọng", code: "00055" },
          { name: "Phường Dịch Vọng Hậu", code: "00056" },
          { name: "Phường Mai Dịch", code: "00057" },
          { name: "Phường Nghĩa Đô", code: "00058" },
          { name: "Phường Nghĩa Tân", code: "00059" },
          { name: "Phường Quan Hoa", code: "00060" },
          { name: "Phường Trung Hòa", code: "00061" },
          { name: "Phường Yên Hòa", code: "00062" }
        ]
      },
      {
        name: "Quận Đống Đa",
        code: "006",
        wards: [
          { name: "Phường Cát Linh", code: "00063" },
          { name: "Phường Hàng Bột", code: "00064" },
          { name: "Phường Khâm Thiên", code: "00065" },
          { name: "Phường Khương Thượng", code: "00066" },
          { name: "Phường Kim Liên", code: "00067" },
          { name: "Phường Láng Hạ", code: "00068" },
          { name: "Phường Láng Thượng", code: "00069" },
          { name: "Phường Nam Đồng", code: "00070" },
          { name: "Phường Ngã Tư Sở", code: "00071" },
          { name: "Phường Ô Chợ Dừa", code: "00072" },
          { name: "Phường Phương Liên", code: "00073" },
          { name: "Phường Phương Mai", code: "00074" },
          { name: "Phường Quang Trung", code: "00075" },
          { name: "Phường Quốc Tử Giám", code: "00076" },
          { name: "Phường Thịnh Quang", code: "00077" },
          { name: "Phường Thổ Quan", code: "00078" },
          { name: "Phường Trung Liệt", code: "00079" },
          { name: "Phường Trung Phụng", code: "00080" },
          { name: "Phường Trung Tự", code: "00081" },
          { name: "Phường Văn Chương", code: "00082" },
          { name: "Phường Văn Miếu", code: "00083" }
        ]
      },
      {
        name: "Quận Hai Bà Trưng",
        code: "007",
        wards: [
          { name: "Phường Bách Khoa", code: "00084" },
          { name: "Phường Bạch Đằng", code: "00085" },
          { name: "Phường Bùi Thị Xuân", code: "00086" },
          { name: "Phường Cầu Dền", code: "00087" },
          { name: "Phường Đồng Nhân", code: "00088" },
          { name: "Phường Đống Mác", code: "00089" },
          { name: "Phường Lê Đại Hành", code: "00090" },
          { name: "Phường Minh Khai", code: "00091" },
          { name: "Phường Ngô Thì Nhậm", code: "00092" },
          { name: "Phường Phạm Đình Hổ", code: "00093" },
          { name: "Phường Phố Huế", code: "00094" },
          { name: "Phường Quỳnh Lôi", code: "00095" },
          { name: "Phường Quỳnh Mai", code: "00096" },
          { name: "Phường Thanh Lương", code: "00097" },
          { name: "Phường Thanh Nhân", code: "00098" },
          { name: "Phường Trương Định", code: "00099" },
          { name: "Phường Vĩnh Tuy", code: "00100" }
        ]
      },
      {
        name: "Quận Hoàng Mai",
        code: "008",
        wards: [
          { name: "Phường Đại Kim", code: "00101" },
          { name: "Phường Định Công", code: "00102" },
          { name: "Phường Giáp Bát", code: "00103" },
          { name: "Phường Hoàng Liệt", code: "00104" },
          { name: "Phường Hoàng Văn Thụ", code: "00105" },
          { name: "Phường Lĩnh Nam", code: "00106" },
          { name: "Phường Mai Động", code: "00107" },
          { name: "Phường Tân Mai", code: "00108" },
          { name: "Phường Thanh Trì", code: "00109" },
          { name: "Phường Thịnh Liệt", code: "00110" },
          { name: "Phường Trần Phú", code: "00111" },
          { name: "Phường Tương Mai", code: "00112" },
          { name: "Phường Vĩnh Hưng", code: "00113" },
          { name: "Phường Yên Sở", code: "00114" }
        ]
      },
      {
        name: "Quận Thanh Xuân",
        code: "009",
        wards: [
          { name: "Phường Hạ Đình", code: "00115" },
          { name: "Phường Khương Đình", code: "00116" },
          { name: "Phường Khương Mai", code: "00117" },
          { name: "Phường Khương Trung", code: "00118" },
          { name: "Phường Kim Giang", code: "00119" },
          { name: "Phường Nhân Chính", code: "00120" },
          { name: "Phường Phương Liệt", code: "00121" },
          { name: "Phường Thanh Xuân Bắc", code: "00122" },
          { name: "Phường Thanh Xuân Nam", code: "00123" },
          { name: "Phường Thanh Xuân Trung", code: "00124" },
          { name: "Phường Thượng Đình", code: "00125" }
        ]
      },
      {
        name: "Quận Hà Đông",
        code: "010",
        wards: [
          { name: "Phường Biên Giang", code: "00126" },
          { name: "Phường Dương Nội", code: "00127" },
          { name: "Phường Hà Cầu", code: "00128" },
          { name: "Phường La Khê", code: "00129" },
          { name: "Phường Mộ Lao", code: "00130" },
          { name: "Phường Nguyễn Trãi", code: "00131" },
          { name: "Phường Phú La", code: "00132" },
          { name: "Phường Phú Lãm", code: "00133" },
          { name: "Phường Phú Lương", code: "00134" },
          { name: "Phường Quang Trung", code: "00135" },
          { name: "Phường Văn Quán", code: "00136" },
          { name: "Phường Vạn Phúc", code: "00137" },
          { name: "Phường Yết Kiêu", code: "00138" },
          { name: "Phường Yên Nghĩa", code: "00139" }
        ]
      },
      {
        name: "Quận Nam Từ Liêm",
        code: "011",
        wards: [
          { name: "Phường Cầu Diễn", code: "00140" },
          { name: "Phường Đại Mỗ", code: "00141" },
          { name: "Phường Mễ Trì", code: "00142" },
          { name: "Phường Mỹ Đình 1", code: "00143" },
          { name: "Phường Mỹ Đình 2", code: "00144" },
          { name: "Phường Phú Đô", code: "00145" },
          { name: "Phường Phương Canh", code: "00146" },
          { name: "Phường Tây Mỗ", code: "00147" },
          { name: "Phường Trung Văn", code: "00148" },
          { name: "Phường Xuân Phương", code: "00149" }
        ]
      },
      {
        name: "Quận Bắc Từ Liêm",
        code: "012",
        wards: [
          { name: "Phường Cổ Nhuế 1", code: "00150" },
          { name: "Phường Cổ Nhuế 2", code: "00151" },
          { name: "Phường Đông Ngạc", code: "00152" },
          { name: "Phường Đức Thắng", code: "00153" },
          { name: "Phường Liên Mạc", code: "00154" },
          { name: "Phường Minh Khai", code: "00155" },
          { name: "Phường Phú Diễn", code: "00156" },
          { name: "Phường Phúc Diễn", code: "00157" },
          { name: "Phường Thượng Cát", code: "00158" },
          { name: "Phường Thụy Phương", code: "00159" },
          { name: "Phường Tây Tựu", code: "00160" },
          { name: "Phường Xuân Đỉnh", code: "00161" },
          { name: "Phường Xuân Tảo", code: "00162" }
        ]
      }
    ]
  },
  // 2. HỒ CHÍ MINH
  {
    name: "Hồ Chí Minh",
    code: "79",
    districts: [
      {
        name: "Quận 1",
        code: "760",
        wards: [
          { name: "Phường Bến Nghé", code: "26734" },
          { name: "Phường Bến Thành", code: "26737" },
          { name: "Phường Cầu Kho", code: "26740" },
          { name: "Phường Cầu Ông Lãnh", code: "26743" },
          { name: "Phường Cô Giang", code: "26746" },
          { name: "Phường Đa Kao", code: "26749" },
          { name: "Phường Nguyễn Cư Trinh", code: "26752" },
          { name: "Phường Nguyễn Thái Bình", code: "26755" },
          { name: "Phường Phạm Ngũ Lão", code: "26758" },
          { name: "Phường Tân Định", code: "26761" }
        ]
      },
      {
        name: "Quận 3",
        code: "762",
        wards: [
          { name: "Phường 1", code: "26797" },
          { name: "Phường 2", code: "26800" },
          { name: "Phường 3", code: "26803" },
          { name: "Phường 4", code: "26806" },
          { name: "Phường 5", code: "26809" },
          { name: "Phường 6", code: "26812" },
          { name: "Phường 7", code: "26815" },
          { name: "Phường 8", code: "26818" },
          { name: "Phường 9", code: "26821" },
          { name: "Phường 10", code: "26824" },
          { name: "Phường 11", code: "26827" },
          { name: "Phường 12", code: "26830" },
          { name: "Phường 13", code: "26833" },
          { name: "Phường 14", code: "26836" }
        ]
      },
      {
        name: "Quận Tân Bình",
        code: "774",
        wards: [
          { name: "Phường 1", code: "27301" },
          { name: "Phường 2", code: "27304" },
          { name: "Phường 3", code: "27307" },
          { name: "Phường 4", code: "27310" },
          { name: "Phường 5", code: "27313" },
          { name: "Phường 6", code: "27316" },
          { name: "Phường 7", code: "27319" },
          { name: "Phường 8", code: "27322" },
          { name: "Phường 9", code: "27325" },
          { name: "Phường 10", code: "27328" },
          { name: "Phường 11", code: "27331" },
          { name: "Phường 12", code: "27334" },
          { name: "Phường 13", code: "27337" },
          { name: "Phường 14", code: "27340" },
          { name: "Phường 15", code: "27343" }
        ]
      }
    ]
  },
  // 3. ĐÀ NẴNG
  {
    name: "Đà Nẵng",
    code: "48",
    districts: [
      {
        name: "Quận Hải Châu",
        code: "490",
        wards: [
          { name: "Phường Bình Hiên", code: "20194" },
          { name: "Phường Bình Thuận", code: "20195" },
          { name: "Phường Hải Châu 1", code: "20197" },
          { name: "Phường Hải Châu 2", code: "20198" },
          { name: "Phường Hòa Cường Bắc", code: "20200" },
          { name: "Phường Hòa Cường Nam", code: "20201" },
          { name: "Phường Hòa Thuận Đông", code: "20203" },
          { name: "Phường Hòa Thuận Tây", code: "20204" },
          { name: "Phường Nam Dương", code: "20206" },
          { name: "Phường Phước Ninh", code: "20207" },
          { name: "Phường Thanh Bình", code: "20209" },
          { name: "Phường Thạch Thang", code: "20212" },
          { name: "Phường Thuận Phước", code: "20215" }
        ]
      },
      {
        name: "Quận Thanh Khê",
        code: "491",
        wards: [
          { name: "Phường An Khê", code: "20218" },
          { name: "Phường Chính Gián", code: "20221" },
          { name: "Phường Hòa Khê", code: "20224" },
          { name: "Phường Tam Thuận", code: "20227" },
          { name: "Phường Tân Chính", code: "20230" },
          { name: "Phường Thanh Khê Đông", code: "20233" },
          { name: "Phường Thanh Khê Tây", code: "20236" },
          { name: "Phường Thạc Gián", code: "20239" },
          { name: "Phường Vĩnh Trung", code: "20242" },
          { name: "Phường Xuân Hà", code: "20245" }
        ]
      }
    ]
  },
  // 4. HẢI PHÒNG
  {
    name: "Hải Phòng",
    code: "31",
    districts: [
      {
        name: "Quận Hồng Bàng",
        code: "303",
        wards: [
          { name: "Phường Hạ Lý", code: "11116" },
          { name: "Phường Hoàng Văn Thụ", code: "11119" },
          { name: "Phường Hùng Vương", code: "11122" },
          { name: "Phường Phan Bội Châu", code: "11125" },
          { name: "Phường Quán Toan", code: "11128" },
          { name: "Phường Sở Dầu", code: "11131" },
          { name: "Phường Thượng Lý", code: "11134" },
          { name: "Phường Trại Cau", code: "11137" }
        ]
      }
    ]
  },
  // 5. CẦN THƠ
  {
    name: "Cần Thơ",
    code: "92",
    districts: [
      {
        name: "Quận Ninh Kiều",
        code: "916",
        wards: [
          { name: "Phường An Bình", code: "31117" },
          { name: "Phường An Cư", code: "31120" },
          { name: "Phường An Hòa", code: "31123" },
          { name: "Phường An Khánh", code: "31126" },
          { name: "Phường An Nghiệp", code: "31129" },
          { name: "Phường An Phú", code: "31132" },
          { name: "Phường Cái Khế", code: "31135" },
          { name: "Phường Hưng Lợi", code: "31138" },
          { name: "Phường Tân An", code: "31141" },
          { name: "Phường Thới Bình", code: "31144" },
          { name: "Phường Xuân Khánh", code: "31147" }
        ]
      }
    ]
  }
];

// Danh sách 58 tỉnh thành còn lại (chỉ tên)
export const otherVietnamCities: string[] = [
  "Hà Giang",
  "Cao Bằng",
  "Bắc Kạn",
  "Tuyên Quang",
  "Lào Cai",
  "Điện Biên",
  "Lai Châu",
  "Sơn La",
  "Yên Bái",
  "Hòa Bình",
  "Thái Nguyên",
  "Lạng Sơn",
  "Quảng Ninh",
  "Bắc Giang",
  "Phú Thọ",
  "Vĩnh Phúc",
  "Bắc Ninh",
  "Hải Dương",
  "Hưng Yên",
  "Thái Bình",
  "Hà Nam",
  "Nam Định",
  "Ninh Bình",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Bình",
  "Quảng Trị",
  "Thừa Thiên Huế",
  "Quảng Nam",
  "Quảng Ngãi",
  "Bình Định",
  "Phú Yên",
  "Khánh Hòa",
  "Ninh Thuận",
  "Bình Thuận",
  "Kon Tum",
  "Gia Lai",
  "Đắk Lắk",
  "Đắk Nông",
  "Lâm Đồng",
  "Bình Phước",
  "Tây Ninh",
  "Bình Dương",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "Long An",
  "Tiền Giang",
  "Bến Tre",
  "Trà Vinh",
  "Vĩnh Long",
  "Đồng Tháp",
  "An Giang",
  "Kiên Giang",
  "Hậu Giang",
  "Sóc Trăng",
  "Bạc Liêu",
  "Cà Mau"
];

// Helper functions
export const getAllCityNames = (): string[] => {
  const detailedCities = vietnamCities.map(city => city.name);
  return [...detailedCities, ...otherVietnamCities].sort();
};

export const getDistrictsByCity = (cityName: string): District[] => {
  const city = vietnamCities.find(c => c.name === cityName);
  return city ? city.districts : [];
};

export const getWardsByDistrict = (cityName: string, districtName: string): Ward[] => {
  const city = vietnamCities.find(c => c.name === cityName);
  if (!city) return [];
  
  const district = city.districts.find(d => d.name === districtName);
  return district ? district.wards : [];
};
