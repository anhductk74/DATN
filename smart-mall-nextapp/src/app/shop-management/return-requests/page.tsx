"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Image,
  Typography,
  Spin,
  Form,
  Tooltip,
  Badge,
  Progress,
  Divider,
  Avatar,
  Alert,
  App,
  Pagination,
  message as antdMessage
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UndoOutlined,
  ShopOutlined,
  FileImageOutlined,
  ReloadOutlined,
  WarningOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderReturnRequestApiService, { 
  OrderReturnResponseDto, 
  ReturnStatus 
} from "@/services/orderReturnRequestApiService";
import { shopService } from "@/services/ShopService";
import { getCloudinaryUrl } from "@/config/config";
import { useAntdApp } from "@/hooks/useAntdApp";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;

export default function ReturnRequestManagement() {
  const { data: session } = useSession();
  const { message, modal } = useAntdApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [selectedRequest, setSelectedRequest] = useState<OrderReturnResponseDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get owner ID from session
  const ownerId = session?.user?.id;

  // Fetch shop info by owner ID first
  const { data: shopData, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ['shop-by-owner', ownerId],
    queryFn: async () => {
      if (!ownerId) throw new Error('Owner ID is required');
      const response = await shopService.getShopsByOwner(ownerId);
      return response.data && response.data.length > 0 ? response.data[0] : null;
    },
    enabled: !!ownerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const shopId = shopData?.id;

  // Fetch return requests by shop
  const { 
    data: returnRequests, 
    isLoading: requestsLoading, 
    refetch: refetchRequests 
  } = useQuery({
    queryKey: ['shop-return-requests', shopId],
    queryFn: () => orderReturnRequestApiService.getReturnRequestsByShop(shopId!),
    enabled: !!shopId,
    staleTime: 30 * 1000,
  });

  // Status configuration
  const statusConfig = {
    [ReturnStatus.PENDING]: {
      color: 'gold',
      icon: <ClockCircleOutlined />,
      text: 'Pending Review',
      description: 'Waiting for shop response'
    },
    [ReturnStatus.APPROVED]: {
      color: 'blue',
      icon: <CheckCircleOutlined />,
      text: 'Approved',
      description: 'Return request approved'
    },
    [ReturnStatus.REJECTED]: {
      color: 'red',
      icon: <CloseCircleOutlined />,
      text: 'Rejected',
      description: 'Return request rejected'
    },
    [ReturnStatus.COMPLETED]: {
      color: 'green',
      icon: <UndoOutlined />,
      text: 'Completed',
      description: 'Return process completed'
    }
  };

  // Update return request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: ReturnStatus }) =>
      orderReturnRequestApiService.updateReturnStatusByShop(requestId, status),
    onSuccess: (updatedRequest) => {
      message.success(`Return request ${updatedRequest.status.toLowerCase()} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['shop-return-requests'] });
      setDetailModalVisible(false);
    },
    onError: (error: any) => {
      console.error('Failed to update return request:', error);
      message.error('Failed to update return request status');
    },
  });

  // Handle status update
  const handleUpdateStatus = (requestId: string, newStatus: ReturnStatus) => {
    const request = returnRequests?.find(r => r.id === requestId);
    if (!request) return;

    const actionText = newStatus === ReturnStatus.APPROVED ? 'approve' : 
                     newStatus === ReturnStatus.REJECTED ? 'reject' :
                     newStatus === ReturnStatus.COMPLETED ? 'mark as completed' : 'update';

    modal.confirm({
      title: `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      content: `Are you sure you want to ${actionText} this return request?`,
      okText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
      okType: newStatus === ReturnStatus.REJECTED ? 'danger' : 'primary',
      onOk: () => updateStatusMutation.mutate({ requestId, status: newStatus }),
    });
  };

  // Handle view details
  const handleViewDetails = (request: OrderReturnResponseDto) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  // Calculate statistics
  const getStats = () => {
    if (!returnRequests) return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0
    };

    return {
      total: returnRequests.length,
      pending: returnRequests.filter(r => r.status === ReturnStatus.PENDING).length,
      approved: returnRequests.filter(r => r.status === ReturnStatus.APPROVED).length,
      rejected: returnRequests.filter(r => r.status === ReturnStatus.REJECTED).length,
      completed: returnRequests.filter(r => r.status === ReturnStatus.COMPLETED).length,
    };
  };

  const stats = getStats();

  // Filter requests
  const filteredRequests = returnRequests?.filter(request => {
    const matchesSearch = 
      request.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchText.toLowerCase()) ||
      request.id.toLowerCase().includes(searchText.toLowerCase()) ||
      (request.userName && request.userName.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Table columns
  const columns: ColumnsType<OrderReturnResponseDto> = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => (
        <span className="font-mono font-medium text-blue-600">
          #{text.slice(-8)}
        </span>
      ),
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (text) => (
        <span className="font-mono font-medium text-purple-600">
          #{text.slice(-8)}
        </span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (userName) => (
        <div className="flex items-center">
          {/* <Avatar size="small" className="mr-2 bg-blue-500">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar> */}
          <span className="font-medium text-gray-800 truncate">
            {userName || 'Unknown User'}
          </span>
        </div>
      ),
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 140,
      render: (date) => (
        <div>
          <div className="font-medium">
            {new Date(date).toLocaleDateString('vi-VN')}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 250,
      render: (reason) => (
        <div className="max-w-xs">
          <Text className="line-clamp-2" title={reason}>
            {reason}
          </Text>
        </div>
      ),
    },
    {
      title: 'Images',
      dataIndex: 'imageUrls',
      key: 'images',
      width: 120,
      align: 'center',
      render: (imageUrls: string[]) => (
        <div className="flex items-center justify-center">
          {imageUrls && imageUrls.length > 0 ? (
            <div className="flex items-center">
              <FileImageOutlined className="text-blue-500 mr-2" />
              <span className="text-sm font-medium">{imageUrls.length}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">0</span>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status: ReturnStatus) => {
        const config = statusConfig[status];
        return (
          <Tag 
            color={config.color}
            className="px-3 py-1 flex items-center justify-center font-medium"
            style={{ minWidth: '110px' }}
          >
            <span className="mr-3">{config.icon}</span>
            <span>{config.text}</span>
          </Tag>
        );
      },
    },
    {
      title: 'Processed Date',
      dataIndex: 'processedDate',
      key: 'processedDate',
      width: 140,
      render: (date) => (
        date ? (
          <div>
            <div className="font-medium">
              {new Date(date).toLocaleDateString('vi-VN')}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(date).toLocaleTimeString('vi-VN')}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Not processed</span>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {record.status === ReturnStatus.PENDING && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  className="text-green-600 hover:text-green-700"
                  loading={updateStatusMutation.isPending}
                  onClick={() => handleUpdateStatus(record.id, ReturnStatus.APPROVED)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  size="small"
                  danger
                  loading={updateStatusMutation.isPending}
                  onClick={() => handleUpdateStatus(record.id, ReturnStatus.REJECTED)}
                />
              </Tooltip>
            </>
          )}
          
          {record.status === ReturnStatus.APPROVED && (
            <Tooltip title="Mark as Completed">
              <Button
                type="text"
                icon={<UndoOutlined />}
                size="small"
                className="text-blue-600 hover:text-blue-700"
                loading={updateStatusMutation.isPending}
                onClick={() => handleUpdateStatus(record.id, ReturnStatus.COMPLETED)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Show loading while fetching session or shop info
  if (!session || shopLoading || (!shopLoading && !shopId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        {!session && (
          <div className="mt-4 text-center">
            <div className="text-gray-600 mb-2">
              Please login to access return request management
            </div>
          </div>
        )}
        {session && !shopLoading && !shopId && (
          <div className="mt-4 text-center">
            <div className="text-gray-600 mb-2">
              No shop found for your account
            </div>
            {shopError && (
              <div className="text-red-500 text-sm">
                Error: {shopError instanceof Error ? shopError.message : 'Unknown error'}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              Please create a shop first to manage return requests.
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto px-2 md:px-4">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="flex items-center">
            <UndoOutlined className="mr-3 text-orange-600" />
            Return Request Management
          </Title>
          <Paragraph className="text-gray-600 text-lg">
            Manage customer return requests for your shop
          </Paragraph>
          {shopData && (
            <div className="mt-2 text-sm text-gray-500">
              Managing return requests for: <span className="font-medium text-blue-600">{shopData.name}</span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8" justify="space-between">
          <Col xs={24} sm={12} md={8} lg={4} xl={4}>
            <Card className="h-full">
              <Statistic
                title="Total Requests"
                value={stats.total}
                prefix={<UndoOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} xl={4}>
            <Card className="h-full">
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} xl={4}>
            <Card className="h-full">
              <Statistic
                title="Approved"
                value={stats.approved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} xl={4}>
            <Card className="h-full">
              <Statistic
                title="Rejected"
                value={stats.rejected}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} xl={4}>
            <Card className="h-full">
              <Statistic
                title="Completed"
                value={stats.completed}
                prefix={<UndoOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alert for pending requests */}
        {stats.pending > 0 && (
          <Alert
            message={`You have ${stats.pending} pending return request${stats.pending > 1 ? 's' : ''} that need${stats.pending === 1 ? 's' : ''} your attention`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            className="mb-6"
            action={
              <Button size="small" onClick={() => setStatusFilter(ReturnStatus.PENDING)}>
                View Pending
              </Button>
            }
          />
        )}

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            {/* Left group - Search, Status Filter, Date Range */}
            <Col xs={24} lg={18} xl={16}>
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={8} md={6} lg={7}>
                  <Search
                    placeholder="Search requests..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    prefix={<SearchOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6} md={5} lg={5}>
                  <Select
                    placeholder="All Status"
                    style={{ width: '100%' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    size="large"
                  >
                    <Option value="ALL">All Status</Option>
                    <Option value={ReturnStatus.PENDING}>Pending</Option>
                    <Option value={ReturnStatus.APPROVED}>Approved</Option>
                    <Option value={ReturnStatus.REJECTED}>Rejected</Option>
                    <Option value={ReturnStatus.COMPLETED}>Completed</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={10} md={8} lg={8}>
                  <RangePicker 
                    placeholder={['From Date', 'To Date']} 
                    style={{ width: '100%' }} 
                    size="large"
                  />
                </Col>
              </Row>
            </Col>
            
            {/* Right group - Export */}
            <Col xs={24} lg={6} xl={8} className="text-left lg:text-right">
              <Button 
                type="default"
                icon={<ExportOutlined />}
                onClick={() => message.info('Export functionality coming soon')}
                size="middle"
              >
                Export
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Return Requests Table */}
        <Card 
          title={`Return Requests (${filteredRequests.length})`}
          className="mb-6"
        >
          <Table
            columns={columns}
            dataSource={filteredRequests}
            loading={requestsLoading}
            rowKey="id"
            pagination={{
              current: currentPage + 1,
              pageSize: pageSize,
              total: filteredRequests.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} requests`,
              onChange: (page, size) => {
                setCurrentPage(page - 1);
                setPageSize(size || 10);
              },
            }}
            scroll={{ 
              x: 1550, 
              y: 600 
            }}
            size="small"
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={`Return Request Details - #${selectedRequest?.id.slice(-8)}`}
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedRequest(null);
          }}
          width={800}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>,
            ...(selectedRequest?.status === ReturnStatus.PENDING ? [
              <Button 
                key="reject" 
                danger
                icon={<CloseCircleOutlined />}
                loading={updateStatusMutation.isPending}
                onClick={() => selectedRequest && handleUpdateStatus(selectedRequest.id, ReturnStatus.REJECTED)}
              >
                Reject
              </Button>,
              <Button 
                key="approve" 
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={updateStatusMutation.isPending}
                onClick={() => selectedRequest && handleUpdateStatus(selectedRequest.id, ReturnStatus.APPROVED)}
              >
                Approve
              </Button>
            ] : []),
            ...(selectedRequest?.status === ReturnStatus.APPROVED ? [
              <Button 
                key="complete" 
                type="primary"
                icon={<UndoOutlined />}
                loading={updateStatusMutation.isPending}
                onClick={() => selectedRequest && handleUpdateStatus(selectedRequest.id, ReturnStatus.COMPLETED)}
              >
                Mark as Completed
              </Button>
            ] : [])
          ]}
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-l-4 ${
                selectedRequest.status === ReturnStatus.PENDING ? 'bg-yellow-50 border-yellow-400' :
                selectedRequest.status === ReturnStatus.APPROVED ? 'bg-green-50 border-green-400' :
                selectedRequest.status === ReturnStatus.REJECTED ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-center">
                  {statusConfig[selectedRequest.status as ReturnStatus].icon}
                  <div className="ml-3">
                    <div className="font-medium">
                      {statusConfig[selectedRequest.status as ReturnStatus].text}
                    </div>
                    <div className="text-sm text-gray-600">
                      {statusConfig[selectedRequest.status as ReturnStatus].description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <Card title="Request Information" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Request ID">
                    <span className="font-mono text-blue-600">#{selectedRequest.id.slice(-8)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Order ID">
                    <span className="font-mono text-purple-600">#{selectedRequest.orderId.slice(-8)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Name">
                    <div className="flex items-center">
                      {/* <Avatar size="small" className="mr-2 bg-blue-500">
                        {selectedRequest.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar> */}
                      <span className="font-medium text-gray-800">{selectedRequest.userName || 'Unknown User'}</span>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag 
                      color={statusConfig[selectedRequest.status as ReturnStatus].color}
                      className="px-3 py-1"
                    >
                      {statusConfig[selectedRequest.status as ReturnStatus].icon}
                      <span className="ml-1">{statusConfig[selectedRequest.status as ReturnStatus].text}</span>
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Request Date">
                    <div>
                      <div className="font-medium">
                        {new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(selectedRequest.requestDate).toLocaleTimeString('vi-VN')}
                      </div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Processed Date">
                    {selectedRequest.processedDate ? (
                      <div>
                        <div className="font-medium">
                          {new Date(selectedRequest.processedDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(selectedRequest.processedDate).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not processed yet</span>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Return Reason */}
              <Card title="Return Reason" size="small">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Text>{selectedRequest.reason}</Text>
                </div>
              </Card>

              {/* Return Images */}
              {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
                <Card title={`Return Images (${selectedRequest.imageUrls.length})`} size="small">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRequest.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={getCloudinaryUrl(imageUrl)}
                          alt={`Return image ${index + 1}`}
                          className="rounded-lg"
                          style={{ width: '100%', height: 150, objectFit: 'cover' }}
                          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
