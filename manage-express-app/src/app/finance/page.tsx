'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  Progress,
  Modal,
  Form,
  Spin,
  Drawer,
  Descriptions,
  Alert,
  Popconfirm
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  DollarOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { 
  financeService,
  CodReconciliationResponseDto,
  ShipperBalanceHistoryResponseDto,
  FinanceReportResponseDto,
  ReconciliationStatus,
  CodReconciliationRequestDto,
  ShipperBalanceHistoryRequestDto
} from '@/services';
import { shipperApiService, ShipperResponseDto } from '@/services/ShipperApiService';
import { useAntdApp } from '@/hooks/useAntdApp';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Configure dayjs
dayjs.extend(customParseFormat);
dayjs.locale('vi');

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function FinancePage() {
  const { data: session } = useSession();
  const { message } = useAntdApp();
  // State management
  const [activeTab, setActiveTab] = useState<string>('cod-reconciliation');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // COD Reconciliation states
  const [codReconciliations, setCodReconciliations] = useState<CodReconciliationResponseDto[]>([]);
  const [createCodModalVisible, setCreateCodModalVisible] = useState<boolean>(false);
  const [codForm] = Form.useForm();
  
  // Shipper data for select
  const [shippers, setShippers] = useState<ShipperResponseDto[]>([]);
  const [loadingShippers, setLoadingShippers] = useState<boolean>(false);
  
  // Shipper Balance states
  const [shipperBalances, setShipperBalances] = useState<ShipperBalanceHistoryResponseDto[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState<string>('');
  const [balanceDrawerVisible, setBalanceDrawerVisible] = useState<boolean>(false);
  const [selectedShipperBalance, setSelectedShipperBalance] = useState<ShipperBalanceHistoryResponseDto | null>(null);
  const [balanceLoadingShipper, setBalanceLoadingShipper] = useState<boolean>(false);
  const [balanceDateRange, setBalanceDateRange] = useState<[string, string] | null>(null);
  const [balanceFilterType, setBalanceFilterType] = useState<'date' | 'range' | 'shipper'>('date');
  
  // Finance Report states
  const [financeReport, setFinanceReport] = useState<FinanceReportResponseDto | null>(null);
  
  // Statistics
  const [statistics, setStatistics] = useState({
    totalPending: 0,
    totalProcessing: 0,
    totalDone: 0,
    totalAmount: 0
  });

  // Fetch COD Reconciliations by date
  const fetchCodReconciliations = async (date: string = selectedDate) => {
    try {
      setLoading(true);
      const data = await financeService.getCodReconciliationByDate(date);
      setCodReconciliations(data);
      
      // Calculate statistics
      const stats = data.reduce((acc, item) => {
        acc.totalAmount += item.totalCollected;
        switch (item.status) {
          case ReconciliationStatus.PENDING:
            acc.totalPending += 1;
            break;
          case ReconciliationStatus.PROCESSING:
            acc.totalProcessing += 1;
            break;
          case ReconciliationStatus.DONE:
            acc.totalDone += 1;
            break;
        }
        return acc;
      }, { totalPending: 0, totalProcessing: 0, totalDone: 0, totalAmount: 0 });
      
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching COD reconciliations:', error);
      message.error('Không thể tải danh sách đối soát COD');
      setCodReconciliations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipper balance history by date
  const fetchShipperBalances = async (date: string = selectedDate) => {
    try {
      setLoading(true);
      const data = await financeService.getShipperBalanceHistoryByDate(date);
      setShipperBalances(data);
    } catch (error) {
      console.error('Error fetching shipper balances:', error);
      message.error('Không thể tải lịch sử số dư shipper');
      setShipperBalances([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipper balance history by shipper
  const fetchShipperBalancesByShipper = async (shipperId: string) => {
    try {
      setBalanceLoadingShipper(true);
      const data = await financeService.getShipperBalanceHistoryByShipper(shipperId);
      setShipperBalances(data);
    } catch (error) {
      console.error('Error fetching shipper balances by shipper:', error);
      message.error('Không thể tải lịch sử số dư shipper');
      setShipperBalances([]);
    } finally {
      setBalanceLoadingShipper(false);
    }
  };

  // Fetch shipper balance history by date range
  const fetchShipperBalancesByRange = async (from: string, to: string, shipperId?: string) => {
    try {
      setLoading(true);
      const companyId = session?.user?.company?.companyId;
      const data = await financeService.getShipperBalanceHistoryRange(from, to, shipperId, companyId);
      setShipperBalances(data);
    } catch (error) {
      console.error('Error fetching shipper balances by range:', error);
      message.error('Không thể tải lịch sử số dư shipper');
      setShipperBalances([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle balance filter change
  const handleBalanceFilterChange = async () => {
    if (balanceFilterType === 'date') {
      await fetchShipperBalances(selectedDate);
    } else if (balanceFilterType === 'shipper' && selectedShipperId) {
      await fetchShipperBalancesByShipper(selectedShipperId);
    } else if (balanceFilterType === 'range' && balanceDateRange) {
      const [from, to] = balanceDateRange;
      await fetchShipperBalancesByRange(from, to, selectedShipperId || undefined);
    }
  };

  // Fetch finance report
  const fetchFinanceReport = async (date: string = selectedDate) => {
    try {
      setLoading(true);
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        setFinanceReport(null);
        setLoading(false);
        return;
      }
      const data = await financeService.getCompanyFinanceReport(date, companyId);
      setFinanceReport(data);
    } catch (error) {
      console.error('Error fetching finance report:', error);
      message.error('Không thể tải báo cáo tài chính');
      setFinanceReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shippers for select dropdown
  const fetchShippers = async () => {
    try {
      setLoadingShippers(true);
      const response = await shipperApiService.getAllShippers({
        page: 0,
        size: 100, // Get first 100 shippers for dropdown
        status: undefined // Get all statuses
      });
      setShippers(response.data);
    } catch (error) {
      console.error('Error fetching shippers:', error);
      message.error('Không thể tải danh sách shipper');
      setShippers([]);
    } finally {
      setLoadingShippers(false);
    }
  };

  // Initialize selectedDate after component mount
  useEffect(() => {
    setSelectedDate(financeService.getTodayString());
  }, []);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (selectedDate) { // Only fetch when selectedDate is initialized
      if (activeTab === 'cod-reconciliation') {
        fetchCodReconciliations();
      } else if (activeTab === 'shipper-balance') {
        handleBalanceFilterChange();
      } else if (activeTab === 'finance-report') {
        fetchFinanceReport();
      }
    }
  }, [activeTab, selectedDate]);

  // Update balance data when filter parameters change
  useEffect(() => {
    if (activeTab === 'shipper-balance' && selectedDate) {
      handleBalanceFilterChange();
    }
  }, [balanceFilterType, selectedShipperId, balanceDateRange]);
  // Handle create COD reconciliation
  const handleCreateCodReconciliation = async (values: any) => {
    try {
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }

      setLoading(true);
      const dto: CodReconciliationRequestDto = {
        shipperId: values.shipperId,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : selectedDate
      };
      
      await financeService.createCodReconciliation(dto, companyId);
      message.success('Tạo đối soát COD thành công');
      setCreateCodModalVisible(false);
      codForm.resetFields();
      fetchCodReconciliations();
    } catch (error) {
      console.error('Error creating COD reconciliation:', error);
      message.error('Không thể tạo đối soát COD');
    } finally {
      setLoading(false);
    }
  };

  // Handle update COD reconciliation status
  const handleUpdateCodStatus = async (id: string, status: ReconciliationStatus) => {
    try {
      await financeService.updateCodReconciliationStatus(id, { status });
      message.success('Cập nhật trạng thái thành công');
      fetchCodReconciliations();
    } catch (error) {
      console.error('Error updating COD status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  // Handle complete COD reconciliation
  const handleCompleteCodReconciliation = async (id: string) => {
    try {
      await financeService.completeCodReconciliation(id);
      message.success('Hoàn thành đối soát thành công');
      fetchCodReconciliations();
    } catch (error) {
      console.error('Error completing COD reconciliation:', error);
      message.error('Không thể hoàn thành đối soát');
    }
  };

  // COD Reconciliation columns
  const codReconciliationColumns: ColumnsType<CodReconciliationResponseDto> = [
    {
      title: 'Mã đối soát',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text.slice(-8)}</span>
    },
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      width: 150,
      render: (text: string) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          {text}
        </div>
      )
    },
    // {
    //   title: 'Tổng thu',
    //   dataIndex: 'totalCollected',
    //   key: 'totalCollected',
    //   width: 120,
    //   render: (amount: number) => (
    //     <span className="font-medium text-green-600">
    //       {financeService.formatCurrency(amount)}
    //     </span>
    //   )
    // },
    {
      title: 'Tổng nộp',
      dataIndex: 'totalDeposited',
      key: 'totalDeposited',
      width: 120,
      render: (amount: number) => (
        <span className="font-medium text-blue-600">
          {financeService.formatCurrency(amount)}
        </span>
      )
    },
    // {
    //   title: 'Chênh lệch',
    //   dataIndex: 'difference',
    //   key: 'difference',
    //   width: 120,
    //   render: (difference: number) => {
    //     const { color, text } = financeService.calculateDifferenceType(difference);
    //     return (
    //       <span className={`font-medium text-${color}-600`}>
    //         {financeService.formatCurrency(Math.abs(difference))} ({text})
    //       </span>
    //     );
    //   }
    // },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReconciliationStatus) => (
        <Tag color={financeService.getReconciliationStatusColor(status)}>
          {financeService.formatReconciliationStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2" />
          {financeService.formatDate(date)}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: CodReconciliationResponseDto) => (
        <Space>
          {/* <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              // Show detail modal
            }}
          >
            Chi tiết
          </Button> */}
          {record.status === ReconciliationStatus.PENDING && (
            <Popconfirm
              title="Xác nhận chuyển đổi trạng thái"
              description="Bạn muốn chuyển đối soát này sang trạng thái 'Đang xử lý'?"
              onConfirm={() => handleUpdateCodStatus(record.id, ReconciliationStatus.PROCESSING)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button 
                type="primary"
                size="small"
                style={{ backgroundColor: '#1890ff' }}
              >
                Xử lý
              </Button>
            </Popconfirm>
          )}
          {record.status === ReconciliationStatus.PROCESSING && (
            <Popconfirm
              title="Xác nhận hoàn thành đối soát"
              description="Bạn có chắc chắn muốn hoàn thành đối soát này?"
              onConfirm={() => handleCompleteCodReconciliation(record.id)}
              okText="Hoàn thành"
              cancelText="Hủy"
              okType="primary"
            >
              <Button 
                type="primary"
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Hoàn thành
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // Shipper Balance History columns
  const shipperBalanceColumns: ColumnsType<ShipperBalanceHistoryResponseDto> = [
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      width: 150,
      render: (text: string) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          {text}
        </div>
      )
    },
    {
      title: 'Số dư đầu kỳ',
      dataIndex: 'openingBalance',
      key: 'openingBalance',
      width: 130,
      render: (amount: number) => (
        <span className="font-medium">
          {financeService.formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Đã thu',
      dataIndex: 'collected',
      key: 'collected',
      width: 120,
      render: (amount: number) => (
        <span className="text-green-600">
          {financeService.formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Đã nộp',
      dataIndex: 'deposited',
      key: 'deposited',
      width: 120,
      render: (amount: number) => (
        <span className="text-blue-600">
          {financeService.formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      key: 'bonus',
      width: 100,
      render: (amount: number) => (
        <span className="text-orange-600">
          {financeService.formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Số dư cuối kỳ',
      dataIndex: 'finalBalance',
      key: 'finalBalance',
      width: 130,
      render: (amount: number) => (
        <span className="font-medium text-purple-600">
          {financeService.formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2" />
          {financeService.formatDate(date)}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ShipperBalanceHistoryResponseDto) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              setSelectedShipperBalance(record);
              setBalanceDrawerVisible(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quản lý Tài chính</Title>
        <Space>
          <DatePicker
            value={selectedDate ? dayjs(selectedDate, 'YYYY-MM-DD') : null}
            onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : selectedDate)}
            placeholder="Chọn ngày"
            format="YYYY-MM-DD"
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              if (activeTab === 'cod-reconciliation') {
                fetchCodReconciliations();
              } else if (activeTab === 'shipper-balance') {
                handleBalanceFilterChange();
              } else if (activeTab === 'finance-report') {
                fetchFinanceReport();
              }
            }}
            loading={loading || balanceLoadingShipper}
          >
            Tải lại
          </Button>
       
        </Space>
      </div>

      {/* Financial Overview */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics.totalPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={statistics.totalProcessing}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statistics.totalDone}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng tiền"
              value={statistics.totalAmount}
              prefix={<DollarOutlined />}
              formatter={(value) => financeService.formatCurrency(Number(value))}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for different finance functions */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'cod-reconciliation',
              label: 'Đối soát COD',
              children: (
                <>
                  <div className="mb-4">
                    <Space className="w-full justify-between flex">
                      <Space>
                        {selectedDate && (
                          <Alert
                            message={`Hiển thị dữ liệu ngày: ${financeService.formatDate(selectedDate)}`}
                            type="info"
                            showIcon
                            closable={false}
                          />
                        )}
                      </Space>
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setCreateCodModalVisible(true);
                            fetchShippers(); // Load shippers when opening modal
                            // Set initial date value
                            codForm.setFieldsValue({
                              date: selectedDate ? dayjs(selectedDate, 'YYYY-MM-DD') : dayjs()
                            });
                          }}
                        >
                          Tạo đối soát COD
                        </Button>
                        <Button icon={<ExportOutlined />}>
                          Xuất Excel
                        </Button>
                      </Space>
                    </Space>
                  </div>

                  <Spin spinning={loading}>
                    <Table
                      columns={codReconciliationColumns}
                      dataSource={codReconciliations}
                      rowKey="id"
                      scroll={{ x: 1200 }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `${range[0]}-${range[1]} của ${total} đối soát`
                      }}
                    />
                  </Spin>
                </>
              )
            },
            {
              key: 'shipper-balance',
              label: 'Lịch sử số dư Shipper',
              children: (
                <>
                  {/* Filter Controls */}
                  <div className="mb-4">
                    <Card size="small" className="mb-4">
                      <div className="flex flex-wrap gap-4 items-end">
                        <div>
                          <label className="block text-sm font-medium mb-2">Loại lọc</label>
                          <Select
                            value={balanceFilterType}
                            onChange={(value) => {
                              setBalanceFilterType(value);
                              setSelectedShipperId('');
                              setBalanceDateRange(null);
                            }}
                            style={{ width: 200 }}
                            options={[
                              { value: 'date', label: 'Theo ngày' },
                              { value: 'range', label: 'Theo khoảng thời gian' },
                              { value: 'shipper', label: 'Theo shipper' }
                            ]}
                          />
                        </div>

                        {balanceFilterType === 'date' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Ngày</label>
                            <DatePicker
                              value={selectedDate ? dayjs(selectedDate, 'YYYY-MM-DD') : null}
                              onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : selectedDate)}
                              format="YYYY-MM-DD"
                              style={{ width: 200 }}
                            />
                          </div>
                        )}

                        {balanceFilterType === 'range' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Khoảng thời gian</label>
                            <RangePicker
                              value={balanceDateRange ? [dayjs(balanceDateRange[0]), dayjs(balanceDateRange[1])] : null}
                              onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                  setBalanceDateRange([
                                    dates[0].format('YYYY-MM-DD'),
                                    dates[1].format('YYYY-MM-DD')
                                  ]);
                                } else {
                                  setBalanceDateRange(null);
                                }
                              }}
                              format="YYYY-MM-DD"
                              style={{ width: 280 }}
                            />
                          </div>
                        )}

                        {(balanceFilterType === 'shipper' || balanceFilterType === 'range') && (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Shipper {balanceFilterType === 'range' ? '(Tùy chọn)' : ''}
                            </label>
                            <Select
                              value={selectedShipperId || undefined}
                              onChange={setSelectedShipperId}
                              placeholder="Chọn shipper"
                              allowClear={balanceFilterType === 'range'}
                              showSearch
                              loading={loadingShippers}
                              style={{ width: 250 }}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              onFocus={fetchShippers}
                              options={shippers.map(shipper => ({
                                value: shipper.id,
                                label: `${shipper.fullName} - ${shipper.phoneNumber}`
                              }))}
                            />
                          </div>
                        )}

                        <div>
                          <Button 
                            type="primary" 
                            icon={<SearchOutlined />}
                            onClick={handleBalanceFilterChange}
                            loading={loading || balanceLoadingShipper}
                          >
                            Tìm kiếm
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <Space className="w-full justify-between flex">
                      <Space>
                        {/* Display current filter info */}
                        {balanceFilterType === 'date' && selectedDate && (
                          <Alert
                            message={`Hiển thị dữ liệu ngày: ${financeService.formatDate(selectedDate)}`}
                            type="info"
                            showIcon
                            closable={false}
                          />
                        )}
                        {balanceFilterType === 'range' && balanceDateRange && (
                          <Alert
                            message={`Hiển thị dữ liệu từ ${financeService.formatDate(balanceDateRange[0])} đến ${financeService.formatDate(balanceDateRange[1])}${selectedShipperId ? ` - Shipper: ${shippers.find(s => s.id === selectedShipperId)?.fullName || 'Không xác định'}` : ''}`}
                            type="info"
                            showIcon
                            closable={false}
                          />
                        )}
                        {balanceFilterType === 'shipper' && selectedShipperId && (
                          <Alert
                            message={`Hiển thị dữ liệu shipper: ${shippers.find(s => s.id === selectedShipperId)?.fullName || 'Không xác định'}`}
                            type="info"
                            showIcon
                            closable={false}
                          />
                        )}
                        
                        {/* Summary statistics */}
                        {shipperBalances.length > 0 && (
                          <div className="flex gap-6 text-sm ml-6">
                            <span><strong>Tổng thu:</strong> {financeService.formatCurrency(financeService.calculateTotalCollected(shipperBalances))}</span>
                            <span><strong>Tổng nộp:</strong> {financeService.formatCurrency(financeService.calculateTotalDeposited(shipperBalances))}</span>
                            <span><strong>Tổng thưởng:</strong> {financeService.formatCurrency(financeService.calculateTotalBonus(shipperBalances))}</span>
                          </div>
                        )}
                      </Space>
                      <Space>
                        <Button icon={<ExportOutlined />}>
                          Xuất Excel
                        </Button>
                      </Space>
                    </Space>
                  </div>

                  <Spin spinning={loading || balanceLoadingShipper}>
                    <Table
                      columns={shipperBalanceColumns}
                      dataSource={shipperBalances}
                      rowKey="id"
                      scroll={{ x: 1000 }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `${range[0]}-${range[1]} của ${total} bản ghi`
                      }}
                    />
                  </Spin>
                </>
              )
            },
            {
              key: 'finance-report',
              label: 'Báo cáo tài chính',
              children: (
                <>
                  <div className="mb-4">
                    <Space className="w-full justify-between flex">
                      <Space>
                        {selectedDate && (
                          <Alert
                            message={`Báo cáo ngày: ${financeService.formatDate(selectedDate)}`}
                            type="info"
                            showIcon
                            closable={false}
                          />
                        )}
                      </Space>
                      <Space>
                        <Button type="primary" icon={<ExportOutlined />}>
                          Tạo báo cáo mới
                        </Button>
                      </Space>
                    </Space>
                  </div>

                  <Spin spinning={loading}>
                    {financeReport ? (
                      <>
                        <Row gutter={16} className="mb-6">
                          <Col span={6}>
                            <Card>
                              <Statistic
                                title="Tổng thu"
                                value={financeReport.totalCollected}
                                formatter={(value) => financeService.formatCurrency(Number(value))}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<DollarOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col span={6}>
                            <Card>
                              <Statistic
                                title="Tổng nộp"
                                value={financeReport.totalDeposited}
                                formatter={(value) => financeService.formatCurrency(Number(value))}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<DollarOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col span={6}>
                            <Card>
                              <Statistic
                                title="Tổng thưởng"
                                value={financeReport.totalBonus}
                                formatter={(value) => financeService.formatCurrency(Number(value))}
                                valueStyle={{ color: '#fa8c16' }}
                                prefix={<DollarOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col span={6}>
                            <Card>
                              <Statistic
                                title="Chưa thu"
                                value={Math.abs(financeReport.difference)}
                                formatter={(value) => financeService.formatCurrency(Number(value))}
                                valueStyle={{ color: financeReport.difference >= 0 ? '#52c41a' : '#ff4d4f' }}
                                prefix={financeReport.difference >= 0 ? '+' : '-'}
                             
                              />
                            </Card>
                          </Col>
                        </Row>
                        
                        {/* Additional summary information */}
                        <Card title="Chi tiết báo cáo" className="mb-4">
                          <Row gutter={16}>
                            <Col span={12}>
                              <div className="space-y-2">
                                <div className="flex gap-4">
                                  <span>Ngày báo cáo:</span>
                                  <span className="font-medium">{financeService.formatDate(financeReport.date)}</span>
                                </div>
                                <div className="flex gap-4">
                                  <span>Tỷ lệ nộp/thu:</span>
                                  <span className="font-medium">
                                    {financeReport.totalCollected > 0 
                                      ? ((financeReport.totalDeposited / financeReport.totalCollected) * 100).toFixed(1) + '%'
                                      : '0%'
                                    }
                                  </span>
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="space-y-2">
                                <div className="flex gap-4">
                                  <span>Trạng thái:</span>
                                  <span className={`font-medium ${
                                    financeReport.difference >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {financeReport.difference >= 0 ? 'Cân bằng tốt' : 'Cần theo dõi'}
                                  </span>
                                </div>
                                <div className="flex gap-4">
                                  <span>Thưởng/Thu:</span>
                                  <span className="font-medium">
                                    {financeReport.totalCollected > 0 
                                      ? ((financeReport.totalBonus / financeReport.totalCollected) * 100).toFixed(2) + '%'
                                      : '0%'
                                    }
                                  </span>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Alert
                          message="Không có dữ liệu báo cáo"
                          description="Chưa có báo cáo tài chính cho ngày được chọn"
                          type="warning"
                          showIcon
                        />
                      </div>
                    )}
                  </Spin>
                </>
              )
            }
          ]}
        />
      </Card>

      {/* Create COD Reconciliation Modal */}
      <Modal
        title="Tạo đối soát COD"
        open={createCodModalVisible}
        onCancel={() => {
          setCreateCodModalVisible(false);
          codForm.resetFields();
        }}
        onOk={() => codForm.submit()}
        confirmLoading={loading}
        width={600}
        okText="Tạo đối soát"
        cancelText="Hủy"
      >
        <Form 
          form={codForm}
          layout="vertical"
          onFinish={handleCreateCodReconciliation}
          initialValues={{
            date: selectedDate ? dayjs(selectedDate, 'YYYY-MM-DD') : dayjs()
          }}
        >
          <Form.Item
            label="Shipper"
            name="shipperId"
            rules={[{ required: true, message: 'Vui lòng chọn shipper' }]}
          >
            <Select
              placeholder={loadingShippers ? "Đang tải danh sách shipper..." : "Chọn shipper"}
              loading={loadingShippers}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={shippers.map(shipper => ({
                value: shipper.id,
                label: `${shipper.fullName} - ${shipper.phoneNumber} (${shipperApiService.formatStatus(shipper.status)})`,
                shipper: shipper
              }))}
              optionRender={(option) => (
                <div className="flex flex-col">
                  <div className="font-medium">{option.data.shipper.fullName}</div>
                  <div className="text-sm text-gray-500">
                    {option.data.shipper.phoneNumber} • {option.data.shipper.operationalRegionFull} • {shipperApiService.formatStatus(option.data.shipper.status)}
                  </div>
                </div>
              )}
              notFoundContent={loadingShippers ? <Spin size="small" /> : "Không tìm thấy shipper"}
            />
          </Form.Item>

          {/* Display selected shipper info */}
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.shipperId !== currentValues.shipperId}>
            {({ getFieldValue }) => {
              const selectedShipperId = getFieldValue('shipperId');
              const selectedShipper = shippers.find(s => s.id === selectedShipperId);
              
              if (selectedShipper) {
                return (
                  <Alert
                    message="Thông tin shipper đã chọn"
                    description={
                      <div className="mt-2">
                        <p><strong>Tên:</strong> {selectedShipper.fullName}</p>
                        <p><strong>Điện thoại:</strong> {selectedShipper.phoneNumber}</p>
                        <p><strong>Khu vực:</strong> {selectedShipper.operationalRegionFull}</p>
                        <p><strong>Phương tiện:</strong> {selectedShipper.vehicleType} - {selectedShipper.licensePlate}</p>
                        <p><strong>Trạng thái:</strong> <Tag color={shipperApiService.getStatusColor(selectedShipper.status)}>
                          {shipperApiService.formatStatus(selectedShipper.status)}
                        </Tag></p>
                      </div>
                    }
                    type="info"
                    showIcon
                  />
                );
              }
              return null;
            }}
          </Form.Item>
          
          <Form.Item
            label="Ngày đối soát"
            name="date"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="Chọn ngày đối soát"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Shipper Balance Detail Drawer */}
      <Drawer
        title="Chi tiết số dư Shipper"
        placement="right"
        onClose={() => {
          setBalanceDrawerVisible(false);
          setSelectedShipperBalance(null);
        }}
        open={balanceDrawerVisible}
        width={600}
      >
        {selectedShipperBalance && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Shipper">
              {selectedShipperBalance.shipperName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày">
              {financeService.formatDate(selectedShipperBalance.date)}
            </Descriptions.Item>
            <Descriptions.Item label="Số dư đầu kỳ">
              <span className="font-medium">
                {financeService.formatCurrency(selectedShipperBalance.openingBalance)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền đã thu">
              <span className="text-green-600 font-medium">
                {financeService.formatCurrency(selectedShipperBalance.collected)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền đã nộp">
              <span className="text-blue-600 font-medium">
                {financeService.formatCurrency(selectedShipperBalance.deposited)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Thưởng">
              <span className="text-orange-600 font-medium">
                {financeService.formatCurrency(selectedShipperBalance.bonus)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Số dư cuối kỳ">
              <span className="text-purple-600 font-medium text-lg">
                {financeService.formatCurrency(selectedShipperBalance.finalBalance)}
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}