import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Alert,
  Typography,
  Space,
  Select,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
  CodeOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useRegisterManager } from '../../hooks/useManagers';
import type { ManagerRegisterDto } from '../../types/manager.types';
import './RegisterManager.css';

const { Title, Text } = Typography;

// Sample data for autocomplete - Vietnam provinces and districts
const SAMPLE_STREETS = [
  '100 Đường Lê Thánh Tôn',
  '235 Nguyễn Văn Cừ',
  '123 Hai Bà Trưng',
  '456 Trần Hưng Đạo',
  '789 Lý Thường Kiệt',
  '15 Điện Biên Phủ',
  '88 Võ Văn Tần',
  '45 Pasteur',
  '67 Nam Kỳ Khởi Nghĩa',
  '99 Cách Mạng Tháng 8',
  '234 Lê Lợi',
  '156 Nguyễn Huệ',
  '78 Trường Chinh',
  '90 Hoàng Hoa Thám',
  '345 Phan Chu Trinh',
];

// 63 provinces/cities of Vietnam
const SAMPLE_CITIES = [
  // Municipalities (Thành phố trực thuộc TW)
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  
  // Northern provinces (Miền Bắc)
  'Hà Giang',
  'Cao Bằng',
  'Bắc Kạn',
  'Tuyên Quang',
  'Lào Cai',
  'Điện Biên',
  'Lai Châu',
  'Sơn La',
  'Yên Bái',
  'Hòa Bình',
  'Thái Nguyên',
  'Lạng Sơn',
  'Quảng Ninh',
  'Bắc Giang',
  'Phú Thọ',
  'Vĩnh Phúc',
  'Bắc Ninh',
  'Hải Dương',
  'Hưng Yên',
  'Thái Bình',
  'Hà Nam',
  'Nam Định',
  'Ninh Bình',
  
  // Central provinces (Miền Trung)
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Bình',
  'Quảng Trị',
  'Thừa Thiên Huế',
  'Quảng Nam',
  'Quảng Ngãi',
  'Bình Định',
  'Phú Yên',
  'Khánh Hòa',
  'Ninh Thuận',
  'Bình Thuận',
  'Kon Tum',
  'Gia Lai',
  'Đắk Lắk',
  'Đắk Nông',
  'Lâm Đồng',
  
  // Southern provinces (Miền Nam)
  'Bình Phước',
  'Tây Ninh',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Long An',
  'Tiền Giang',
  'Bến Tre',
  'Trà Vinh',
  'Vĩnh Long',
  'Đồng Tháp',
  'An Giang',
  'Kiên Giang',
  'Hậu Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Cà Mau',
];

// Districts by city/province
const SAMPLE_DISTRICTS: Record<string, string[]> = {
  // Hồ Chí Minh City
  'Hồ Chí Minh': [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Bình Tân',
    'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
    'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Cần Giờ',
    'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè',
  ],
  
  // Hanoi
  'Hà Nội': [
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên',
    'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Hai Bà Trưng', 'Quận Hoàng Mai',
    'Quận Thanh Xuân', 'Quận Hà Đông', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm',
    'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 'Huyện Đông Anh',
    'Huyện Gia Lâm', 'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức',
    'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai', 'Huyện Sóc Sơn',
    'Huyện Thạch Thất', 'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín',
    'Huyện Ứng Hòa', 'Thị xã Sơn Tây',
  ],
  
  // Đà Nẵng
  'Đà Nẵng': [
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn',
    'Quận Liên Chiểu', 'Quận Cẩm Lệ', 'Huyện Hòa Vang', 'Huyện Hoàng Sa',
  ],
  
  // Hải Phòng
  'Hải Phòng': [
    'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An',
    'Quận Kiến An', 'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện An Dương',
    'Huyện An Lão', 'Huyện Bạch Long Vĩ', 'Huyện Cát Hải', 'Huyện Kiến Thụy',
    'Huyện Thủy Nguyên', 'Huyện Tiên Lãng', 'Huyện Vĩnh Bảo',
  ],
  
  // Cần Thơ
  'Cần Thơ': [
    'Quận Ninh Kiều', 'Quận Ô Môn', 'Quận Bình Thuỷ', 'Quận Cái Răng',
    'Quận Thốt Nốt', 'Huyện Vĩnh Thạnh', 'Huyện Cờ Đỏ', 'Huyện Phong Điền',
    'Huyện Thới Lai',
  ],
  
  // Other major provinces
  'Thanh Hóa': [
    'Thành phố Thanh Hóa', 'Thị xã Bỉm Sơn', 'Thị xã Sầm Sơn',
    'Huyện Bá Thước', 'Huyện Cẩm Thủy', 'Huyện Đông Sơn', 'Huyện Hà Trung',
    'Huyện Hậu Lộc', 'Huyện Hoằng Hóa', 'Huyện Lang Chánh', 'Huyện Mường Lát',
  ],
  
  'Nghệ An': [
    'Thành phố Vinh', 'Thị xã Cửa Lò', 'Thị xã Thái Hoà',
    'Huyện Anh Sơn', 'Huyện Con Cuông', 'Huyện Diễn Châu', 'Huyện Đô Lương',
    'Huyện Hưng Nguyên', 'Huyện Kỳ Sơn', 'Huyện Nam Đàn', 'Huyện Nghi Lộc',
  ],
  
  'Quảng Ninh': [
    'Thành phố Hạ Long', 'Thành phố Móng Cái', 'Thành phố Cẩm Phả', 'Thành phố Uông Bí',
    'Huyện Bình Liêu', 'Huyện Cô Tô', 'Huyện Đầm Hà', 'Huyện Hải Hà',
    'Huyện Tiên Yên', 'Huyện Vân Đồn', 'Thị xã Quảng Yên', 'Thị xã Đông Triều',
  ],
  
  'Bình Dương': [
    'Thành phố Thủ Dầu Một', 'Thành phố Dĩ An', 'Thành phố Thuận An', 'Thị xã Tân Uyên',
    'Thị xã Bến Cát', 'Huyện Dầu Tiếng', 'Huyện Phú Giáo', 'Huyện Bàu Bàng', 'Huyện Bắc Tân Uyên',
  ],
  
  'Đồng Nai': [
    'Thành phố Biên Hòa', 'Thành phố Long Khánh',
    'Huyện Cẩm Mỹ', 'Huyện Định Quán', 'Huyện Long Thành', 'Huyện Nhơn Trạch',
    'Huyện Tân Phú', 'Huyện Thống Nhất', 'Huyện Trảng Bom', 'Huyện Vĩnh Cửu', 'Huyện Xuân Lộc',
  ],
  
  'Khánh Hòa': [
    'Thành phố Nha Trang', 'Thành phố Cam Ranh', 'Thị xã Ninh Hòa',
    'Huyện Cam Lâm', 'Huyện Diên Khánh', 'Huyện Khánh Sơn', 'Huyện Khánh Vĩnh',
    'Huyện Trường Sa', 'Huyện Vạn Ninh',
  ],
  
  'Lâm Đồng': [
    'Thành phố Đà Lạt', 'Thành phố Bảo Lộc',
    'Huyện Bảo Lâm', 'Huyện Cát Tiên', 'Huyện Đạ Huoai', 'Huyện Đạ Tẻh',
    'Huyện Đam Rông', 'Huyện Di Linh', 'Huyện Đơn Dương', 'Huyện Đức Trọng',
    'Huyện Lạc Dương', 'Huyện Lâm Hà',
  ],
};

// Communes/Wards by district
const SAMPLE_COMMUNES: Record<string, string[]> = {
  // HCM City Districts - All wards
  'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
  'Quận 2': ['Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình An', 'Phường Bình Khánh', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Thạnh Mỹ Lợi', 'Phường Thảo Điền', 'Phường Thủ Thiêm'],
  'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
  'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'],
  'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
  'Quận 6': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
  'Quận 7': ['Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Phú Thuận', 'Phường Tân Hưng', 'Phường Tân Kiểng', 'Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây'],
  'Quận 8': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
  'Quận 9': ['Phường Hiệp Phú', 'Phường Long Bình', 'Phường Long Phước', 'Phường Long Thạnh Mỹ', 'Phường Long Trường', 'Phường Phú Hữu', 'Phường Phước Bình', 'Phường Phước Long A', 'Phường Phước Long B', 'Phường Tân Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Trường Thạnh'],
  'Quận 10': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
  'Quận 11': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
  'Quận 12': ['Phường An Phú Đông', 'Phường Đông Hưng Thuận', 'Phường Hiệp Thành', 'Phường Tân Chánh Hiệp', 'Phường Tân Hưng Thuận', 'Phường Tân Thới Hiệp', 'Phường Tân Thới Nhất', 'Phường Thạnh Lộc', 'Phường Thạnh Xuân', 'Phường Thới An', 'Phường Trung Mỹ Tây'],
  'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
  'Quận Bình Tân': ['Phường An Lạc', 'Phường An Lạc A', 'Phường Bình Hưng Hòa', 'Phường Bình Hưng Hòa A', 'Phường Bình Hưng Hòa B', 'Phường Bình Trị Đông', 'Phường Bình Trị Đông A', 'Phường Bình Trị Đông B', 'Phường Tân Tạo', 'Phường Tân Tạo A'],
  'Quận Tân Bình': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
  'Quận Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'],
  'Quận Phú Nhuận': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 15', 'Phường 17'],
  'Quận Tân Phú': ['Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa', 'Phường Phú Trung', 'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì', 'Phường Tân Thành', 'Phường Tân Thới Hòa', 'Phường Tây Thạnh'],
  'Quận Thủ Đức': ['Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Tây', 'Phường Linh Trung', 'Phường Linh Xuân', 'Phường Tam Bình', 'Phường Tam Phú', 'Phường Trường Thọ'],
  
  // Hanoi Districts - All wards
  'Quận Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc'],
  'Quận Hoàn Kiếm': ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân', 'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Bông', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo'],
  'Quận Tây Hồ': ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An', 'Phường Thụy Khuê', 'Phường Tứ Liên', 'Phường Xuân La', 'Phường Yên Phụ'],
  'Quận Long Biên': ['Phường Bồ Đề', 'Phường Cự Khối', 'Phường Đức Giang', 'Phường Gia Thụy', 'Phường Giang Biên', 'Phường Long Biên', 'Phường Ngọc Lâm', 'Phường Ngọc Thụy', 'Phường Phúc Đồng', 'Phường Phúc Lợi', 'Phường Sài Đồng', 'Phường Thạch Bàn', 'Phường Thượng Thanh', 'Phường Việt Hưng'],
  'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
  'Quận Đống Đa': ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu'],
  'Quận Hai Bà Trưng': ['Phường Bách Khoa', 'Phường Bạch Đằng', 'Phường Bùi Thị Xuân', 'Phường Cầu Dền', 'Phường Đồng Nhân', 'Phường Đống Mác', 'Phường Lê Đại Hành', 'Phường Minh Khai', 'Phường Ngô Thì Nhậm', 'Phường Phạm Đình Hổ', 'Phường Phố Huế', 'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Thanh Lương', 'Phường Thanh Nhân', 'Phường Trương Định', 'Phường Vĩnh Tuy'],
  'Quận Hoàng Mai': ['Phường Đại Kim', 'Phường Định Công', 'Phường Giáp Bát', 'Phường Hoàng Liệt', 'Phường Hoàng Văn Thụ', 'Phường Lĩnh Nam', 'Phường Mai Động', 'Phường Tân Mai', 'Phường Thanh Trì', 'Phường Thịnh Liệt', 'Phường Trần Phú', 'Phường Tương Mai', 'Phường Vĩnh Hưng', 'Phường Yên Sở'],
  'Quận Thanh Xuân': ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung', 'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình'],
  'Quận Hà Đông': ['Phường Biên Giang', 'Phường Dương Nội', 'Phường Hà Cầu', 'Phường La Khê', 'Phường Mộ Lao', 'Phường Nguyễn Trãi', 'Phường Phú La', 'Phường Phú Lãm', 'Phường Phú Lương', 'Phường Quang Trung', 'Phường Văn Quán', 'Phường Vạn Phúc', 'Phường Yết Kiêu', 'Phường Yên Nghĩa'],
  'Quận Nam Từ Liêm': ['Phường Cầu Diễn', 'Phường Đại Mỗ', 'Phường Mễ Trì', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Phương Canh', 'Phường Tây Mỗ', 'Phường Trung Văn', 'Phường Xuân Phương'],
  'Quận Bắc Từ Liêm': ['Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đông Ngạc', 'Phường Đức Thắng', 'Phường Liên Mạc', 'Phường Minh Khai', 'Phường Phú Diễn', 'Phường Phúc Diễn', 'Phường Thượng Cát', 'Phường Thụy Phương', 'Phường Tây Tựu', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo'],
  
  // Đà Nẵng Districts - All wards
  'Quận Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thanh Bình', 'Phường Thạch Thang', 'Phường Thuận Phước'],
  'Quận Thanh Khê': ['Phường An Khê', 'Phường Chính Gián', 'Phường Hòa Khê', 'Phường Tam Thuận', 'Phường Tân Chính', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Thạc Gián', 'Phường Vĩnh Trung', 'Phường Xuân Hà'],
  'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'],
  'Quận Ngũ Hành Sơn': ['Phường Hòa Hải', 'Phường Hòa Quý', 'Phường Khuê Mỹ', 'Phường Mỹ An'],
  'Quận Liên Chiểu': ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Minh'],
  'Quận Cẩm Lệ': ['Phường Hòa An', 'Phường Hòa Phát', 'Phường Hòa Thọ Đông', 'Phường Hòa Thọ Tây', 'Phường Hòa Xuân', 'Phường Khuê Trung'],
};

const RegisterManager: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const registerManager = useRegisterManager();
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // Convert companyStreet from array to string (mode="tags" returns array)
      const submitData: ManagerRegisterDto = {
        ...values,
        companyStreet: Array.isArray(values.companyStreet) 
          ? values.companyStreet[0] || ''
          : values.companyStreet,
      } as ManagerRegisterDto;
      
      await registerManager.mutateAsync(submitData);
      form.resetFields();
      navigate('/dashboard/managers');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedDistrict('');
    // Clear district and commune when city changes
    form.setFieldValue('companyDistrict', undefined);
    form.setFieldValue('companyCommune', undefined);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    // Clear commune field when district changes
    form.setFieldValue('companyCommune', undefined);
  };

  const getDistrictOptions = () => {
    if (selectedCity && SAMPLE_DISTRICTS[selectedCity]) {
      return SAMPLE_DISTRICTS[selectedCity];
    }
    return [];
  };

  const getCommuneOptions = () => {
    if (selectedDistrict && SAMPLE_COMMUNES[selectedDistrict]) {
      return SAMPLE_COMMUNES[selectedDistrict];
    }
    return [];
  };

  return (
    <div className="register-manager-container">
      <Card className="register-manager-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Register New Manager</Title>
            <Text type="secondary">
              Create a new manager account with shipping company information
            </Text>
          </div>

          <Alert
            message="Admin Only"
            description="Only administrators can register new managers. The manager will be able to manage shippers in their designated district."
            type="info"
            showIcon
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark="optional"
          >
            {/* User Information Section */}
            <Divider orientation="left">
              <UserOutlined /> Manager Information
            </Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please input email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="manager@example.com"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please input password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Minimum 6 characters"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[{ required: true, message: 'Please input full name!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nguyễn Văn A"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: 'Please input phone number!' },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: 'Phone number must be 10 digits!',
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0901234567"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Company Information Section */}
            <Divider orientation="left">
              <ShopOutlined /> Shipping Company Information
            </Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Company Name"
                  name="companyName"
                  rules={[{ required: true, message: 'Please input company name!' }]}
                >
                  <Input
                    prefix={<ShopOutlined />}
                    placeholder="Viettel Post"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Company Code (Optional)" name="companyCode">
                  <Input
                    prefix={<CodeOutlined />}
                    placeholder="VTP"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Contact Email (Optional)" name="companyContactEmail">
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="contact@company.com"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Contact Phone (Optional)" name="companyContactPhone">
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="1900xxxx"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Company Address Section */}
            <Divider orientation="left">
              <EnvironmentOutlined /> Company Headquarters Address
            </Divider>

            <Alert
              message="Important: District Validation"
              description="The district you specify here will be used to validate shipper registrations. Shippers can only operate in the same district as the company headquarters."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="City/Province"
                  name="companyCity"
                  rules={[{ required: true, message: 'Please select city/province!' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select city/province"
                    size="large"
                    onChange={handleCityChange}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={SAMPLE_CITIES.map(city => ({
                      label: city,
                      value: city,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="District"
                  name="companyDistrict"
                  rules={[{ required: true, message: 'Please select district!' }]}
                  tooltip="This district will be used to validate shipper operational areas"
                >
                  <Select
                    showSearch
                    placeholder={selectedCity ? 'Select district' : 'Select city first'}
                    size="large"
                    onChange={handleDistrictChange}
                    disabled={!selectedCity}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getDistrictOptions().map(district => ({
                      label: district,
                      value: district,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Commune/Ward"
                  name="companyCommune"
                  rules={[{ required: true, message: 'Please select commune/ward!' }]}
                >
                  <Select
                    showSearch
                    placeholder={selectedDistrict ? 'Select commune/ward' : 'Select district first'}
                    size="large"
                    disabled={!selectedDistrict}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getCommuneOptions().map(commune => ({
                      label: commune,
                      value: commune,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Street Address"
                  name="companyStreet"
                  rules={[{ required: true, message: 'Please input street address!' }]}
                >
                  <Select
                    mode="tags"
                    showSearch
                    placeholder="Select or type street address"
                    size="large"
                    maxTagCount={1}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={SAMPLE_STREETS.map(street => ({
                      label: street,
                      value: street,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Submit Button */}
            <Form.Item style={{ marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button
                  type="default"
                  size="large"
                  onClick={() => navigate('/dashboard/managers')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<UserOutlined />}
                >
                  Register Manager
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default RegisterManager;
