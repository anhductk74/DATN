import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  message,
  Typography,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useVouchers, useCreateVoucher, useDeactivateVoucher } from '../../hooks/useVouchers';
import type { VoucherResponseDto, VoucherRequestDto, VoucherType } from '../../types/voucher.types';
import './Vouchers.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Vouchers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<VoucherType | 'ALL'>('ALL');
  const [form] = Form.useForm();

  // Hooks
  const { data: vouchers, isLoading, refetch, error } = useVouchers();
  const createVoucher = useCreateVoucher();
  const deactivateVoucher = useDeactivateVoucher();



  // Show error message if fetch fails
  if (error) {
    console.error('Error loading vouchers:', error);
  }

  // Handle create voucher
  const handleCreateVoucher = async (values: any) => {
    try {
      const voucherData: VoucherRequestDto = {
        code: values.code,
        description: values.description,
        type: values.type,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountAmount: values.maxDiscountAmount,
        minOrderValue: values.minOrderValue,
        usageLimit: values.usageLimit,
        shopId: values.shopId,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        active: values.active ?? true,
      };

      await createVoucher.mutateAsync(voucherData);
      message.success('Voucher created successfully!');
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create voucher');
    }
  };

  // Handle deactivate voucher
  const handleDeactivateVoucher = async (id: string) => {
    try {
      await deactivateVoucher.mutateAsync(id);
      message.success('Voucher deactivated successfully!');
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to deactivate voucher');
    }
  };

  // Filter vouchers
  const filteredVouchers = vouchers?.filter((voucher: VoucherResponseDto) => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchText.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'ALL' || voucher.type === filterType;
    return matchesSearch && matchesType;
  });



  // Table columns
  const columns: ColumnsType<VoucherResponseDto> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      width: 150,
      render: (code: string) => (
        <Tag color="blue" className="voucher-code-tag">
          {code}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: 'System', value: 'SYSTEM' },
        { text: 'Shop', value: 'SHOP' },
        { text: 'Shipping', value: 'SHIPPING' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: VoucherType) => {
        const color = type === 'SYSTEM' ? 'purple' : type === 'SHOP' ? 'green' : 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 150,
      render: (_, record) => {
        const value = record.discountType === 'PERCENTAGE' 
          ? `${record.discountValue}%` 
          : `${record.discountValue.toLocaleString()}₫`;
        return (
          <Tag color="red" className="voucher-code-tag">
            {value}
          </Tag>
        );
      },
    },
    {
      title: 'Min Order',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      width: 120,
      render: (value?: number) => value ? `${value.toLocaleString()}₫` : '-',
    },
    {
      title: 'Max Discount',
      dataIndex: 'maxDiscountAmount',
      key: 'maxDiscountAmount',
      width: 130,
      render: (value?: number) => value ? `${value.toLocaleString()}₫` : '-',
    },
    {
      title: 'Usage',
      key: 'usage',
      width: 100,
      render: (_, record) => {
        const limit = record.usageLimit || '∞';
        const used = record.usedCount;
        return (
          <span>
            {used} / {limit}
          </span>
        );
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      fixed: 'right',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.active ? (
            <Popconfirm
              title="Deactivate Voucher"
              description="Are you sure you want to deactivate this voucher?"
              onConfirm={() => handleDeactivateVoucher(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                size="small"
              >
                Deactivate
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="default"
              size="small"
              disabled
            >
              Inactive
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="voucher-container">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <div className="voucher-header">
            <Title level={3} className="voucher-title">
              <GiftOutlined className="voucher-title-icon" />
              Voucher Management
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Create Voucher
              </Button>
            </Space>
          </div>

          <Space className="voucher-search-section">
            <Input
              placeholder="Search by code or description"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="voucher-search-input"
              allowClear
            />
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value)}
              className="voucher-type-filter"
            >
              <Option value="ALL">All Types</Option>
              <Option value="SYSTEM">System</Option>
              <Option value="SHOP">Shop</Option>
              <Option value="SHIPPING">Shipping</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredVouchers}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} vouchers`,
          }}
          locale={{
            emptyText: error 
              ? 'Failed to load vouchers. Please check your connection and try again.' 
              : 'No vouchers found. Click "Create Voucher" to add one.',
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title="Create New Voucher"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createVoucher.isPending}
        className="voucher-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVoucher}
          initialValues={{
            active: true,
            discountType: 'PERCENTAGE',
            type: 'SYSTEM',
          }}
        >
          <Form.Item
            label="Voucher Code"
            name="code"
            rules={[
              { required: true, message: 'Please enter voucher code' },
              { pattern: /^[A-Z0-9_]+$/, message: 'Code must be uppercase letters, numbers, and underscores only' },
            ]}
          >
            <Input placeholder="e.g., SUMMER2024" maxLength={20} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder="Describe the voucher..." />
          </Form.Item>

          <Space className="voucher-form-space" size="large">
            <Form.Item
              label="Voucher Type"
              name="type"
              rules={[{ required: true }]}
              className="voucher-form-item-200"
            >
              <Select>
                <Option value="SYSTEM">System</Option>
                <Option value="SHOP">Shop</Option>
                <Option value="SHIPPING">Shipping</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Discount Type"
              name="discountType"
              rules={[{ required: true }]}
              className="voucher-form-item-200"
            >
              <Select>
                <Option value="PERCENTAGE">Percentage</Option>
                <Option value="FIXED_AMOUNT">Fixed Amount</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space className="voucher-form-space" size="large">
            <Form.Item
              label="Discount Value"
              name="discountValue"
              rules={[{ required: true, message: 'Please enter discount value' }]}
              className="voucher-form-item-200"
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="e.g., 10"
              />
            </Form.Item>

            <Form.Item
              label="Max Discount Amount"
              name="maxDiscountAmount"
              className="voucher-form-item-200"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Optional"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Space>

          <Space className="voucher-form-space" size="large">
            <Form.Item
              label="Min Order Value"
              name="minOrderValue"
              className="voucher-form-item-200"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Optional"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item
              label="Usage Limit"
              name="usageLimit"
              className="voucher-form-item-200"
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="Optional"
              />
            </Form.Item>
          </Space>

          <Form.Item
            label="Shop ID (for Shop vouchers)"
            name="shopId"
            tooltip="Only required for Shop type vouchers"
          >
            <Input placeholder="Enter shop UUID" />
          </Form.Item>

          <Form.Item
            label="Valid Period"
            name="dateRange"
            rules={[{ required: true, message: 'Please select valid period' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Active"
            name="active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
