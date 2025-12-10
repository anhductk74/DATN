'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Table, 
  Button, 
  Input,
  InputNumber,
  Select, 
  Space, 
  Tag, 
  Avatar,
  Drawer, 
  Form, 
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  App,
  Spin,
  Alert,
  Upload,
  message as antdMessage
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  UploadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  shipperApiService,
  ShipperResponseDto, 
  ShipperStatus, 
  ShipperRegisterDto,
  ShipperUpdateDto
} from '@/services/ShipperApiService';
import ShippingCompanyService, { ShippingCompanyListDto } from '@/services/ShippingCompanyService';
import { locationService, type Province, type District, type Ward } from '@/services/LocationService';

const { Title } = Typography;

export default function ShippersPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ShipperResponseDto | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shippers, setShippers] = useState<ShipperResponseDto[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompanyListDto[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    busy: 0,
    inactive: 0,
    onLeave: 0,
    suspended: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [deliveryStats, setDeliveryStats] = useState<Record<string, {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
  }>>({});
  
  // Address selection states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);
  
  // Shipping company location states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCompany, setSelectedCompany] = useState<ShippingCompanyListDto | null>(null);
  const [companyProvince, setCompanyProvince] = useState<Province | null>(null);
  const [companyDistrict, setCompanyDistrict] = useState<District | null>(null);
  const [availableWardsInCompanyDistrict, setAvailableWardsInCompanyDistrict] = useState<Ward[]>([]);
  
  // Image upload states
  const [idCardFrontFile, setIdCardFrontFile] = useState<File | null>(null);
  const [idCardBackFile, setIdCardBackFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);

  // Fetch shippers data
  const fetchShippers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const filters = {
        search: searchText || undefined,
        status: selectedStatus !== 'all' ? (selectedStatus as ShipperStatus) : undefined,
        page: page - 1, // Backend uses 0-based index
        size: pageSize
      };

      const response = await shipperApiService.getAllShippers(filters);
      setShippers(response.data);
      setPagination({
        current: response.currentPage + 1, // Convert to 1-based for Ant Design
        pageSize: pageSize,
        total: response.totalItems
      });
      
      // Fetch delivery stats for all loaded shippers
      if (response.data && response.data.length > 0) {
        fetchAllDeliveryStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching shippers:', error);
      message.error('Không thể tải danh sách shipper');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await shipperApiService.getShipperStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch shipping companies
  const fetchShippingCompanies = async () => {
    try {
      const companies = await ShippingCompanyService.getActiveCompanies();
      setShippingCompanies(companies);
    } catch (error) {
      console.error('Error fetching shipping companies:', error);
      message.error('Không thể tải danh sách công ty vận chuyển');
    }
  };





  // Fetch delivery stats for all shippers
  const fetchAllDeliveryStats = async (shipperList: ShipperResponseDto[]) => {
   
    try {
      const statsPromises = shipperList.map(shipper => 
        shipperApiService.getShipperDeliveryStats(shipper.id)
          .then((stats: { totalDeliveries: number; successfulDeliveries: number; failedDeliveries: number; successRate: number }) => {
            
            return { shipperId: shipper.id, stats };
          })
          .catch((error: Error) => {
            console.error(`Error fetching stats for shipper ${shipper.id}:`, error);
            return { 
              shipperId: shipper.id, 
              stats: { totalDeliveries: 0, successfulDeliveries: 0, failedDeliveries: 0, successRate: 0 }
            };
          })
      );
      
      const allStats = await Promise.all(statsPromises);
      const statsMap = allStats.reduce((acc: Record<string, { totalDeliveries: number; successfulDeliveries: number; failedDeliveries: number; successRate: number }>, { shipperId, stats }: { shipperId: string; stats: { totalDeliveries: number; successfulDeliveries: number; failedDeliveries: number; successRate: number } }) => {
        acc[shipperId] = stats;
        return acc;
      }, {});
      
      
      setDeliveryStats(statsMap);
    } catch (error) {
      console.error('Error fetching all delivery stats:', error);
    }
  };

  // Fetch provinces on mount
  const fetchProvinces = async () => {
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      message.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  useEffect(() => {
    fetchShippers();
    fetchStatistics();
    fetchShippingCompanies();
    fetchProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fill company info from session when modal opens
  useEffect(() => {
    if (createModalVisible && session?.user?.company && shippingCompanies.length > 0 && provinces.length > 0) {
      const company = session.user.company;
      
      // Find matching shipping company by ID or name
      const matchingCompany = shippingCompanies.find(
        c => c.id === company.companyId || c.name === company.companyName
      );
      
      if (matchingCompany) {
        // Set company ID and operational fields in form
        createForm.setFieldsValue({
          shippingCompanyId: matchingCompany.id,
          operationalCity: company.city,
          operationalDistrict: company.district
        });
        
        // Trigger company change to load wards
        handleCompanyChange(matchingCompany.id);
      } else if (company.companyId) {
        // Even if not found in list, set the ID from session
        createForm.setFieldsValue({
          shippingCompanyId: company.companyId,
          operationalCity: company.city,
          operationalDistrict: company.district
        });
        
        // Trigger company change with session company ID
        handleCompanyChange(company.companyId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createModalVisible, session, shippingCompanies, provinces]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchShippers(1, pagination.pageSize);
    }, 500); // Debounce search

    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedStatus]);

  const handleTableChange = (newPagination: { current?: number; pageSize?: number }) => {
    fetchShippers(newPagination.current || 1, newPagination.pageSize || 10);
  };

  const handleViewDetails = async (record: ShipperResponseDto) => {
    router.push(`/shippers/${record.id}`);
  };

  const handleEdit = (record: ShipperResponseDto) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
    form.setFieldsValue({
      status: record.status,
      vehicleType: record.vehicleType,
      licensePlate: record.licensePlate,
      vehicleBrand: record.vehicleBrand,
      vehicleColor: record.vehicleColor,
      operationalCommune: record.operationalCommune,
      operationalDistrict: record.operationalDistrict,
      operationalCity: record.operationalCity,
      maxDeliveryRadius: record.maxDeliveryRadius
    });
  };

  const handleUpdate = async (values: ShipperUpdateDto) => {
    if (!selectedRecord) return;

    try {
      // Parse maxDeliveryRadius to number if it exists
      const updateData: ShipperUpdateDto = {
        ...values,
        maxDeliveryRadius: values.maxDeliveryRadius ? parseFloat(values.maxDeliveryRadius.toString()) : undefined
      };
      
      console.log('🔄 Updating shipper ID:', selectedRecord.id);
      console.log('🔄 Update data:', updateData);
      
      const response = await shipperApiService.updateShipper(selectedRecord.id, updateData);
      console.log('✅ Update response:', response);
      
      message.success('Cập nhật thông tin shipper thành công');
      
      // Wait for data refresh before closing drawer
      await fetchShippers(pagination.current, pagination.pageSize);
      await fetchStatistics();
      
      setDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('❌ Error updating shipper:', error);
      message.error('Không thể cập nhật thông tin shipper');
    }
  };

  const handleProvinceChange = async (provinceCode: string) => {
    const province = provinces.find(p => p.code === provinceCode);
    setSelectedProvince(province || null);
    setSelectedDistrict(null);
    setAvailableDistricts([]);
    setAvailableWards([]);
    
    createForm.setFieldsValue({ 
      city: province?.name,
      district: undefined, 
      commune: undefined 
    });

    if (provinceCode) {
      try {
        const districts = await locationService.getDistricts(provinceCode);
        setAvailableDistricts(districts);
      } catch (error) {
        console.error('Error fetching districts:', error);
        message.error('Không thể tải danh sách quận/huyện');
      }
    }
  };

  const handleDistrictChange = async (districtCode: string) => {
    const district = availableDistricts.find(d => d.code === districtCode);
    setSelectedDistrict(district || null);
    setAvailableWards([]);
    
    createForm.setFieldsValue({ 
      district: district?.name,
      commune: undefined 
    });

    if (districtCode) {
      try {
        const wards = await locationService.getWards(districtCode);
        setAvailableWards(wards);
      } catch (error) {
        console.error('Error fetching wards:', error);
        message.error('Không thể tải danh sách phường/xã');
      }
    }
  };

  const handleWardChange = (wardCode: string) => {
    const ward = availableWards.find(w => w.code === wardCode);
    createForm.setFieldsValue({ commune: ward?.name });
  };

  const handleCompanyChange = async (companyId: string) => {
    const company = shippingCompanies.find(c => c.id === companyId);
    console.log('=== HANDLE COMPANY CHANGE ===');
    console.log('Selected company from list:', company);
    
    // If company doesn't have address info, try to get from session
    let cityName = company?.city;
    let districtName = company?.district;
    
    // If session user is manager and selected their own company, use session company info
    if (session?.user?.company && session.user.company.companyId === companyId) {
      console.log('Using session company info:', session.user.company);
      cityName = session.user.company.city;
      districtName = session.user.company.district;
    }
    
    console.log('Company city:', cityName);
    console.log('Company district:', districtName);
    
    setSelectedCompany(company || null);
    setCompanyProvince(null);
    setCompanyDistrict(null);
    setAvailableWardsInCompanyDistrict([]);
    createForm.setFieldsValue({ regionWards: undefined, region: undefined });
    
    if (!cityName || !districtName) {
      message.warning('Công ty này chưa có địa chỉ đầy đủ');
      return;
    }
    
    try {
      console.log('Total provinces available:', provinces.length);
      
      // Normalize and find province with multiple patterns
      const normalizedCity = cityName.trim();
      console.log('Looking for city:', normalizedCity);
      
      // Try multiple matching patterns
      const province = provinces.find(p => {
        const pName = p.name.trim();
        const pNameEn = p.name_en?.toLowerCase() || '';
        const searchCity = normalizedCity.toLowerCase();
        
        // Exact match
        if (pName === normalizedCity) return true;
        
        // Case-insensitive match
        if (pName.toLowerCase() === searchCity) return true;
        
        // English name match
        if (pNameEn === searchCity) return true;
        
        // Contains match (e.g., "Đà Nẵng" contains in "Thành phố Đà Nẵng")
        if (pName.includes(normalizedCity) || normalizedCity.includes(pName)) return true;
        
        // Remove "Thành phố", "Tỉnh" prefix
        const cityWithoutPrefix = normalizedCity
          .replace(/^(Thành phố|Tỉnh)\s+/i, '')
          .trim();
        if (pName.includes(cityWithoutPrefix) || cityWithoutPrefix.includes(pName)) return true;
        
        return false;
      });
      
      if (!province) {
        console.error('Province not found. Available provinces:', provinces.map(p => p.name));
        message.error(`Không tìm thấy tỉnh/thành phố "${cityName}"`);
        return;
      }
      
      console.log('✅ Province found:', province);
      setCompanyProvince(province);
      
      // Fetch districts for this province
      console.log('Fetching districts for province code:', province.code);
      const districts = await locationService.getDistricts(province.code);
      console.log('Districts fetched:', districts.length, districts.map(d => d.name));
      
      // Normalize and find district with multiple patterns
      const normalizedDistrict = districtName.trim();
      console.log('Looking for district:', normalizedDistrict);
      
      const district = districts.find(d => {
        const dName = d.name.trim();
        const dNameEn = d.name_en?.toLowerCase() || '';
        const searchDistrict = normalizedDistrict.toLowerCase();
        
        // Exact match
        if (dName === normalizedDistrict) return true;
        
        // Case-insensitive match
        if (dName.toLowerCase() === searchDistrict) return true;
        
        // English name match
        if (dNameEn === searchDistrict) return true;
        
        // Contains match
        if (dName.includes(normalizedDistrict) || normalizedDistrict.includes(dName)) return true;
        
        // Remove "Quận", "Huyện", "Thị xã", "Thành phố" prefix
        const districtWithoutPrefix = normalizedDistrict
          .replace(/^(Quận|Huyện|Thị xã|Thành phố)\s+/i, '')
          .trim();
        const dNameWithoutPrefix = dName
          .replace(/^(Quận|Huyện|Thị xã|Thành phố)\s+/i, '')
          .trim();
        
        if (districtWithoutPrefix === dNameWithoutPrefix) return true;
        if (dName.includes(districtWithoutPrefix) || districtWithoutPrefix.includes(dName)) return true;
        
        return false;
      });
      
      if (!district) {
        console.error('District not found. Available districts:', districts.map(d => d.name));
        message.error(`Không tìm thấy quận "${districtName}" trong ${cityName}`);
        return;
      }
      
      console.log('✅ District found:', district);
      setCompanyDistrict(district);
      
      // Fetch wards for this district
      console.log('Fetching wards for district code:', district.code);
      const wards = await locationService.getWards(district.code);
      console.log('✅ Wards fetched:', wards.length);
      
      if (wards.length === 0) {
        message.warning(`Không có phường/xã nào trong ${districtName}`);
        return;
      }
      
      setAvailableWardsInCompanyDistrict(wards);
      message.success(`Đã tải ${wards.length} phường/xã trong ${districtName}`);
      
    } catch (error) {
      console.error('Error loading company location:', error);
      message.error('Không thể tải thông tin khu vực của công ty');
    }
  };

  const handleWardsChange = (wardNames: string[]) => {
    // Format: "Phường Bến Nghé, Phường Bến Thành, Phường Cầu Kho"
    const regionString = wardNames.join(', ');
    createForm.setFieldsValue({ region: regionString });
  };

  const handleCreate = async (values: ShipperRegisterDto & { regionWards?: string[] }) => {
    setSubmitting(true);
    try {
      // Use session company if available
      const companyId = session?.user?.company?.companyId || values.shippingCompanyId;
      const companyEmail = session?.user?.company?.contactEmail;
      
      if (!companyId) {
        message.error('Vui lòng chọn công ty vận chuyển');
        return;
      }
      
      // Validate email domain matches company
      if (companyEmail && values.email) {
        const companyDomain = companyEmail.substring(companyEmail.indexOf('@'));
        if (!values.email.endsWith(companyDomain)) {
          message.error(`Email phải có đuôi ${companyDomain} của công ty`);
          return;
        }
      }
      
      // Validate operational region
      if (!values.operationalCommune) {
        message.error('Vui lòng chọn phường/xã hoạt động');
        return;
      }
      
      if (!values.operationalDistrict || !values.operationalCity) {
        message.error('Không tìm thấy thông tin khu vực hoạt động');
        return;
      }
      
      // NEW API STRUCTURE: Prepare dataInfo object (will be JSON stringified in service)
      const registerDto: ShipperRegisterDto = {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        street: values.street,
        commune: values.commune,
        district: values.district,
        city: values.city,
        shippingCompanyId: companyId,
        idCardNumber: values.idCardNumber,
        driverLicenseNumber: values.driverLicenseNumber,
        vehicleType: values.vehicleType,
        licensePlate: values.licensePlate,
        vehicleBrand: values.vehicleBrand,
        vehicleColor: values.vehicleColor,
        operationalCommune: values.operationalCommune,
        operationalDistrict: values.operationalDistrict,
        operationalCity: values.operationalCity,
        maxDeliveryRadius: values.maxDeliveryRadius ? parseFloat(values.maxDeliveryRadius.toString()) : undefined
      };

      console.log('📦 Registering shipper with NEW API structure:');
      console.log('dataInfo (will be JSON):', registerDto);
      console.log('dataImage (files):', {
        idCardFrontImage: idCardFrontFile ? `${idCardFrontFile.name} (${idCardFrontFile.size} bytes)` : 'none',
        idCardBackImage: idCardBackFile ? `${idCardBackFile.name} (${idCardBackFile.size} bytes)` : 'none',
        driverLicenseImage: driverLicenseFile ? `${driverLicenseFile.name} (${driverLicenseFile.size} bytes)` : 'none'
      });
      
      // Prepare files for upload (dataImage part)
      const files = {
        idCardFrontImage: idCardFrontFile || undefined,
        idCardBackImage: idCardBackFile || undefined,
        driverLicenseImage: driverLicenseFile || undefined
      };
      
      await shipperApiService.registerShipper(registerDto, files);
      message.success('Đăng ký shipper mới thành công');
      setCreateModalVisible(false);
      createForm.resetFields();
      // Reset file states
      setIdCardFrontFile(null);
      setIdCardBackFile(null);
      setDriverLicenseFile(null);
      // Reset address states
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setAvailableDistricts([]);
      setAvailableWards([]);
      // Reset company location states
      setSelectedCompany(null);
      setCompanyProvince(null);
      setCompanyDistrict(null);
      setAvailableWardsInCompanyDistrict([]);
      fetchShippers(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error: unknown) {
      console.error('Error registering shipper:', error);
      
      // Extract error message from response
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      
      // Log full error details for debugging
      console.error('Full error response:', err?.response);
      console.error('Error status:', err?.response?.status);
      console.error('Error data:', err?.response?.data);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Không thể đăng ký shipper mới';
      
      // Special handling for common errors
      if (err?.response?.status === 409) {
        message.error(`Email đã tồn tại: ${errorMessage}`);
      } else if (err?.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (err?.response?.status === 500) {
        message.error(`Lỗi server: ${errorMessage}`);
      } else {
        message.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'motorbike': 
      case 'xe máy': 
        return '🏍️';
      case 'car': 
      case 'ô tô':
      case 'oto':
        return '🚗';
      case 'truck': 
      case 'xe tải':
      case 'xetai':
        return '🚚';
      default: 
        return '🚚';
    }
  };

  const getVehicleText = (type: string): string => {
    const texts: Record<string, string> = {
      'motorbike': 'Xe máy',
      'car': 'Ô tô',
      'truck': 'Xe tải',
      'bicycle': 'Xe đạp'
    };
    return texts[type?.toLowerCase()] || type;
  };

  const columns: ColumnsType<ShipperResponseDto> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: ShipperResponseDto, index: number) => {
        const pageIndex = (pagination.current - 1) * pagination.pageSize + index + 1;
        return <span className="font-medium text-gray-600">{pageIndex}</span>;
      }
    },
    {
      title: 'Thông tin',
      key: 'info',
      width: 200,
      render: (_: unknown, record: ShipperResponseDto) => (
        <div className="flex items-center space-x-3 gap-1">
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.phoneNumber}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Phương tiện',
      key: 'vehicle',
      width: 150,
      render: (_: unknown, record: ShipperResponseDto) => (
        <div>
          <div className="flex items-center space-x-2">
            <span>{getVehicleIcon(record.vehicleType)}</span>
            <span>{getVehicleText(record.vehicleType)}</span>
          </div>
          <div className="text-sm text-gray-500">{record.licensePlate}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ShipperStatus) => (
        <Tag color={shipperApiService.getStatusColor(status)}>
          {shipperApiService.formatStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Email',
      key: 'username',
      width: 180,
      render: (_: unknown, record: ShipperResponseDto) => (
        <div className="text-sm">{record.username || '-'}</div>
      )
    },
        {
      title: 'Thống kê',
      key: 'stats',
      width: 120,
      render: (_: unknown, record: ShipperResponseDto) => {
        // Check if vehicle type is truck
        const isTruck = record.vehicleType?.toLowerCase().includes('tải') || 
                       record.vehicleType?.toLowerCase() === 'truck';
        
        if (isTruck) {
          return (
            <div className="text-sm text-gray-400 italic">
              Không áp dụng
            </div>
          );
        }
        
        const stats = deliveryStats[record.id] || {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0
        };
        
        return (
          <div>
            <div className="text-sm">
              <span className="font-medium">{stats.totalDeliveries}</span> đơn
            </div>
            <div className="text-sm text-green-600">
              {stats.successRate.toFixed(1)}% thành công
            </div>
          </div>
        );
      }
    },
    {
      title: 'Công ty vận chuyển',
      dataIndex: 'shippingCompanyName',
      key: 'shippingCompanyName',
      width: 240,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: ShipperResponseDto) => (
        <Space>
          <Button 
            type="text" 
            size="small"
            style={{ color: '#1890ff' }}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Space>
      )
    }
  ];

  const filteredData = shippers;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quản lý Shipper</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Thêm Shipper mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={12} className="mb-6">
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Tổng Shipper"
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang bận"
              value={statistics.busy}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Không hoạt động"
              value={statistics.inactive}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#cf1322', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang nghỉ phép"
              value={statistics.onLeave}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Tạm khóa"
              value={statistics.suspended}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full justify-between flex">
          <Space>
            <Input
              placeholder="Tìm kiếm tên, ID, số điện thoại..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              style={{ width: 180 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value={ShipperStatus.ACTIVE}>Sẵn sàng</Select.Option>
              <Select.Option value={ShipperStatus.BUSY}>Đang giao hàng</Select.Option>
              <Select.Option value={ShipperStatus.INACTIVE}>Không hoạt động</Select.Option>
              <Select.Option value={ShipperStatus.ON_LEAVE}>Nghỉ phép</Select.Option>
              <Select.Option value={ShipperStatus.SUSPENDED}>Tạm ngưng</Select.Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1400 }}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} shipper`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Đăng ký Shipper mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Title level={5}>Thông tin tài khoản</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Email" 
                name="email" 
                rules={[
                  { required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      
                      // Get company email domain from session
                      const companyEmail = session?.user?.company?.contactEmail;
                      if (!companyEmail) {
                        return Promise.reject(new Error('Không tìm thấy thông tin email công ty'));
                      }
                      
                      // Extract domain from company email (e.g., "@ghtk.com")
                      const emailDomain = companyEmail.substring(companyEmail.indexOf('@'));
                      
                      // Check if shipper email has same domain
                      if (!value.endsWith(emailDomain)) {
                        return Promise.reject(
                          new Error(`Email phải có đuôi ${emailDomain} của công ty`)
                        );
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
                extra={session?.user?.company?.contactEmail ? 
                  `Email phải có đuôi ${session.user.company.contactEmail.substring(session.user.company.contactEmail.indexOf('@'))}` : 
                  null
                }
              >
                <Input placeholder={session?.user?.company?.contactEmail ? 
                  `shipper${session.user.company.contactEmail.substring(session.user.company.contactEmail.indexOf('@'))}` : 
                  "shipper@company.com"
                } />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Mật khẩu" 
                name="password" 
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password placeholder="Tối thiểu 6 ký tự" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: '16px' }}>Thông tin cá nhân</Title>
          <Form.Item 
            label="Họ và tên" 
            name="fullName" 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="Số điện thoại" 
                name="phoneNumber" 
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Giới tính" 
                name="gender" 
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Ngày sinh" 
                name="dateOfBirth" 
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: '16px' }}>Địa chỉ</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="Tỉnh/Thành phố" 
                name="cityCode"
                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
              >
                <Select 
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={handleProvinceChange}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={provinces.map(province => ({
                    label: province.name,
                    value: province.code
                  }))}
                />
              </Form.Item>
              <Form.Item name="city" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Quận/Huyện" 
                name="districtCode"
                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
              >
                <Select 
                  placeholder="Chọn quận/huyện"
                  onChange={handleDistrictChange}
                  disabled={!selectedProvince}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableDistricts.map(district => ({
                    label: district.name,
                    value: district.code
                  }))}
                />
              </Form.Item>
              <Form.Item name="district" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Phường/Xã" 
                name="wardCode"
                rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
              >
                <Select 
                  placeholder="Chọn phường/xã"
                  onChange={handleWardChange}
                  disabled={!selectedDistrict}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableWards.map(ward => ({
                    label: ward.name,
                    value: ward.code
                  }))}
                />
              </Form.Item>
              <Form.Item name="commune" hidden>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Số nhà, đường" 
                name="street" 
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input placeholder="123 Đường Lê Lợi" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: '16px' }}>Thông tin nghề nghiệp</Title>
          
          {session?.user?.company && (
            <Alert
              message="Thông tin công ty"
              description={`${session.user.company.companyName} (${session.user.company.companyCode}) - ${session.user.company.district}, ${session.user.company.city}`}
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form.Item 
            label="Công ty vận chuyển" 
            name="shippingCompanyId" 
            rules={[{ required: true, message: 'Vui lòng chọn công ty vận chuyển' }]}
            hidden={!!session?.user?.company}
          >
            <Select 
              placeholder="Chọn công ty vận chuyển"
              onChange={handleCompanyChange}
              showSearch
              loading={shippingCompanies.length === 0}
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={shippingCompanies.map(company => ({
                label: `${company.name} (${company.code})${company.district && company.city ? ` - ${company.district}, ${company.city}` : ''}`,
                value: company.id
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="CMND/CCCD" 
                name="idCardNumber" 
                rules={[
                  { required: true, message: 'Vui lòng nhập số CMND/CCCD' },
                  { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD không hợp lệ' }
                ]}
              >
                <Input placeholder="079095001234" />
              </Form.Item>
              
              <Form.Item label="Ảnh CMND/CCCD mặt trước">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setIdCardFrontFile(file);
                    return false; // Prevent auto upload
                  }}
                  onRemove={() => setIdCardFrontFile(null)}
                  accept="image/*"
                >
                  {!idCardFrontFile && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh mặt trước</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              
              <Form.Item label="Ảnh CMND/CCCD mặt sau">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setIdCardBackFile(file);
                    return false;
                  }}
                  onRemove={() => setIdCardBackFile(null)}
                  accept="image/*"
                >
                  {!idCardBackFile && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh mặt sau</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Số giấy phép lái xe" 
                name="driverLicenseNumber" 
                rules={[{ required: true, message: 'Vui lòng nhập số GPLX' }]}
              >
                <Input placeholder="B2-079095001234" />
              </Form.Item>
              
              <Form.Item label="Ảnh giấy phép lái xe">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setDriverLicenseFile(file);
                    return false;
                  }}
                  onRemove={() => setDriverLicenseFile(null)}
                  accept="image/*"
                >
                  {!driverLicenseFile && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh GPLX</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: '16px' }}>Khu vực hoạt động</Title>
          <Alert
            message="Lưu ý"
            description="Khu vực hoạt động phải cùng quận/huyện với địa chỉ công ty vận chuyển"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="Tỉnh/Thành phố hoạt động" 
                name="operationalCity"
                rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố hoạt động' }]}
                initialValue={session?.user?.company?.city || ''}
              >
                <Input disabled placeholder="Tỉnh/Thành phố hoạt động" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Quận/Huyện hoạt động" 
                name="operationalDistrict"
                rules={[{ required: true, message: 'Vui lòng nhập quận/huyện hoạt động' }]}
                initialValue={session?.user?.company?.district || ''}
              >
                <Input disabled placeholder="Quận/Huyện hoạt động" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Phường/Xã hoạt động" 
                name="operationalCommune"
                rules={[{ required: true, message: 'Vui lòng chọn phường/xã hoạt động' }]}
              >
                <Select 
                  placeholder="Chọn phường/xã hoạt động"
                  disabled={availableWardsInCompanyDistrict.length === 0}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableWardsInCompanyDistrict.map(ward => ({
                    label: ward.name,
                    value: ward.name
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: '16px' }}>Thông tin phương tiện</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Loại phương tiện" 
                name="vehicleType" 
                rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
              >
                <Select placeholder="Chọn loại phương tiện">
                  <Select.Option value="Xe máy">🏍️ Xe máy</Select.Option>
                  <Select.Option value="Ô tô">🚗 Ô tô</Select.Option>
                  <Select.Option value="Xe tải">🚚 Xe tải</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Biển số xe" 
                name="licensePlate" 
                rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
              >
                <Input placeholder="59A-12345" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hãng xe" name="vehicleBrand">
                <Input placeholder="Honda, Yamaha, Toyota..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Màu xe" name="vehicleColor">
                <Input placeholder="Đỏ, Xanh, Trắng..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Các phường/xã hoạt động bổ sung (Tùy chọn)" 
                name="regionWards"
                extra={
                  companyDistrict && companyProvince ? 
                    `Chọn thêm các phường/xã khác trong ${companyDistrict.name}, ${companyProvince.name}` : 
                    'Chọn phường/xã hoạt động chính trước'
                }
              >
                <Select 
                  mode="multiple"
                  placeholder="Chọn các phường/xã hoạt động bổ sung (nếu có)"
                  onChange={handleWardsChange}
                  disabled={availableWardsInCompanyDistrict.length === 0}
                  maxTagCount="responsive"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableWardsInCompanyDistrict.map(ward => ({
                    label: ward.name,
                    value: ward.name
                  }))}
                />
              </Form.Item>
              {availableWardsInCompanyDistrict.length > 0 && (
                <div className="text-green-600 text-xs mb-2">
                  ✅ Có {availableWardsInCompanyDistrict.length} phường/xã trong {companyDistrict?.name}
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Bán kính giao hàng tối đa (km)" 
                name="maxDeliveryRadius"
              >
                <InputNumber 
                  placeholder="15.0" 
                  min={0} 
                  step={0.5}
                  style={{ width: '100%' }}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-2 pt-4 justify-end" style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px' }}>
            <Button onClick={() => {
              setCreateModalVisible(false);
              createForm.resetFields();
            }} disabled={submitting}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Đăng ký Shipper
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Drawer */}
      <Drawer
        title="Cập nhật thông tin Shipper"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          {selectedRecord && (
            <Alert
              message="Thông tin cơ bản"
              description={`${selectedRecord.fullName} - ${selectedRecord.phoneNumber} - ${selectedRecord.username}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Title level={5}>Trạng thái</Title>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={ShipperStatus.ACTIVE}>Sẵn sàng</Select.Option>
              <Select.Option value={ShipperStatus.BUSY}>Đang giao hàng</Select.Option>
              <Select.Option value={ShipperStatus.INACTIVE}>Không hoạt động</Select.Option>
              <Select.Option value={ShipperStatus.ON_LEAVE}>Nghỉ phép</Select.Option>
              <Select.Option value={ShipperStatus.SUSPENDED}>Tạm ngưng</Select.Option>
            </Select>
          </Form.Item>

          <Title level={5} style={{ marginTop: 16 }}>Thông tin phương tiện</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Loại phương tiện" name="vehicleType" rules={[{ required: true }]}>
                <Select placeholder="Chọn loại phương tiện">
                  <Select.Option value="MOTORBIKE">🏍️ Xe máy</Select.Option>
                  <Select.Option value="CAR">🚗 Ô tô</Select.Option>
                  <Select.Option value="TRUCK">🚚 Xe tải</Select.Option>
                  <Select.Option value="BICYCLE">🚲 Xe đạp</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Biển số xe" name="licensePlate" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}>
                <Input placeholder="59A1-12345" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hãng xe" name="vehicleBrand">
                <Input placeholder="Honda, Yamaha, Toyota..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Màu xe" name="vehicleColor">
                <Input placeholder="Đỏ, Xanh, Trắng..." />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 16 }}>Khu vực hoạt động</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Phường/Xã hoạt động" name="operationalCommune">
                <Input placeholder="Phường Bến Thành" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Quận/Huyện" name="operationalDistrict">
                <Input placeholder="Quận 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thành phố" name="operationalCity">
                <Input placeholder="Hồ Chí Minh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Bán kính giao hàng tối đa (km)" 
                name="maxDeliveryRadius"
              >
                <InputNumber 
                  placeholder="15.0" 
                  min={0} 
                  step={0.5}
                  style={{ width: '100%' }}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid #f0f0f0', marginTop: 16, paddingTop: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              Hủy
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}