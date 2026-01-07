"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  App,
  Tooltip,
  Typography,
  Statistic,
  Row,
  Col,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Alert,
  Descriptions,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CalendarOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { voucherApiService, VoucherResponseDto, VoucherType, DiscountType, VoucherRequestDto } from "@/services/VoucherApiService";
import shopService from "@/services/ShopService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function VouchersPage() {
  const { data: session } = useSession();
  const { message, modal } = App.useApp();
  const [createForm] = Form.useForm();
  
  const [vouchers, setVouchers] = useState<VoucherResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);

  useEffect(() => {
    if (session?.user?.id) {
      fetchShopId();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (shopId) {
      fetchVouchers();
    }
  }, [shopId]);

  const fetchShopId = async () => {
    try {
      const response = await shopService.getShopsByOwner(session!.user!.id);
      if (response.data && response.data.length > 0) {
        setShopId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
      message.error("Failed to load shop information");
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherApiService.getAllVouchers();
      // Filter only shop vouchers that belong to this shop
      const shopVouchers = data.filter(
        (v) => v.type === VoucherType.SHOP && v.shopId === shopId
      );
      setVouchers(shopVouchers);
    } catch (error: any) {
      console.error("Error fetching vouchers:", error);
      message.error("Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setDiscountType(DiscountType.PERCENTAGE);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (voucher: VoucherResponseDto) => {
    setSelectedVoucher(voucher);
    setDiscountType(voucher.discountType);
    setIsEditModalOpen(true);
  };

  const handleOpenDetailModal = (voucher: VoucherResponseDto) => {
    setSelectedVoucher(voucher);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedVoucher(null);
  };

  const handleCreateVoucher = async (values: any) => {
    if (!shopId) {
      message.error("Shop information not found");
      return;
    }

    setSubmitting(true);
    try {
      const voucherData: VoucherRequestDto = {
        code: values.code.toUpperCase(),
        description: values.description,
        type: VoucherType.SHOP,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountAmount: values.maxDiscountAmount,
        minOrderValue: values.minOrderValue,
        usageLimit: values.usageLimit,
        shopId: shopId,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        active: values.active ?? true,
      };

      await voucherApiService.createVoucher(voucherData);
      message.success("Voucher created successfully!");
      handleCloseModals();
      fetchVouchers();
    } catch (error: any) {
      console.error("Error creating voucher:", error);
      message.error(error.response?.data?.message || "Failed to create voucher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string, code: string) => {
    modal.confirm({
      title: "Deactivate Voucher",
      content: `Are you sure you want to deactivate voucher "${code}"?`,
      okText: "Deactivate",
      okType: "danger",
      onOk: async () => {
        try {
          await voucherApiService.deactivateVoucher(id);
          message.success("Voucher deactivated successfully");
          fetchVouchers();
        } catch (error: any) {
          console.error("Error deactivating voucher:", error);
          message.error("Failed to deactivate voucher");
        }
      },
    });
  };

  const getVoucherStatus = (voucher: VoucherResponseDto) => {
    const now = dayjs();
    const startDate = dayjs(voucher.startDate);
    const endDate = dayjs(voucher.endDate);

    if (!voucher.active) {
      return { status: "Inactive", color: "default", icon: <StopOutlined /> };
    }
    if (now.isBefore(startDate)) {
      return { status: "Scheduled", color: "blue", icon: <ClockCircleOutlined /> };
    }
    if (now.isAfter(endDate)) {
      return { status: "Expired", color: "red", icon: <CalendarOutlined /> };
    }
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { status: "Used Up", color: "orange", icon: <StopOutlined /> };
    }
    return { status: "Active", color: "green", icon: <CheckCircleOutlined /> };
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Text strong className="font-mono text-blue-600">
          {code}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: any, record: VoucherResponseDto) => (
        <Space>
          {record.discountType === DiscountType.PERCENTAGE ? (
            <Tag icon={<PercentageOutlined />} color="purple">
              {record.discountValue}%
            </Tag>
          ) : (
            <Tag icon={<DollarOutlined />} color="green">
              ${record.discountValue}
            </Tag>
          )}
          {record.maxDiscountAmount && (
            <Text type="secondary" className="text-xs">
              Max: ${record.maxDiscountAmount}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Min Order",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
      render: (value: number | undefined) =>
        value ? `$${value}` : <Text type="secondary">No min</Text>,
    },
    {
      title: "Usage",
      key: "usage",
      render: (_: any, record: VoucherResponseDto) => (
        <Space direction="vertical" size={0}>
          <Text>
            {record.usedCount} / {record.usageLimit || "∞"}
          </Text>
          {record.usageLimit && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((record.usedCount / record.usageLimit) * 100, 100)}%`,
                }}
              />
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Period",
      key: "period",
      render: (_: any, record: VoucherResponseDto) => (
        <Space direction="vertical" size={0}>
          <Text className="text-xs">
            {dayjs(record.startDate).format("MMM D, YYYY")}
          </Text>
          <Text type="secondary" className="text-xs">
            to {dayjs(record.endDate).format("MMM D, YYYY")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: VoucherResponseDto) => {
        const { status, color, icon } = getVoucherStatus(record);
        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: VoucherResponseDto) => {
        const { status } = getVoucherStatus(record);
        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetailModal(record)}
              />
            </Tooltip>
            {record.active && status !== "Expired" && (
              <Tooltip title="Deactivate">
                <Button
                  type="text"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleDeactivate(record.id, record.code)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Calculate statistics
  const activeVouchers = vouchers.filter(
    (v) => getVoucherStatus(v).status === "Active"
  ).length;
  const totalUsage = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
  const scheduledVouchers = vouchers.filter(
    (v) => getVoucherStatus(v).status === "Scheduled"
  ).length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Vouchers"
              value={activeVouchers}
              prefix={<GiftOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Vouchers"
              value={vouchers.length}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Usage"
              value={totalUsage}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Vouchers Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="mb-0">
              Shop Vouchers
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Create Voucher
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={vouchers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} vouchers`,
          }}
        />
      </Card>

      {/* Create Voucher Modal */}
      <Modal
        title={
          <Space>
            <GiftOutlined className="text-blue-500" />
            <span>Create New Voucher</span>
          </Space>
        }
        open={isCreateModalOpen}
        onCancel={handleCloseModals}
        footer={null}
        width={800}
        destroyOnClose
        afterClose={() => createForm.resetFields()}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateVoucher}
          initialValues={{
            discountType: DiscountType.PERCENTAGE,
            active: true,
          }}
        >
          <Alert
            message="Voucher Information"
            description="Fill in the details below to create a voucher for your shop customers"
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Voucher Code"
                rules={[
                  { required: true, message: "Please enter voucher code" },
                  { 
                    pattern: /^[A-Z0-9]+$/,
                    message: "Code must contain only uppercase letters and numbers" 
                  },
                  { min: 4, message: "Code must be at least 4 characters" },
                  { max: 20, message: "Code must be at most 20 characters" },
                ]}
                tooltip="A unique code that customers will use"
              >
                <Input
                  placeholder="SUMMER2024"
                  maxLength={20}
                  onChange={(e) => {
                    createForm.setFieldValue('code', e.target.value.toUpperCase());
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="dateRange"
                label="Valid Period"
                rules={[{ required: true, message: "Please select valid period" }]}
                tooltip="The date range when this voucher can be used"
              >
                <RangePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter description" },
              { max: 200, message: "Description must be at most 200 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the voucher offer"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="discountType"
                label="Discount Type"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={(value) => setDiscountType(value)}
                  options={[
                    { value: DiscountType.PERCENTAGE, label: "Percentage Discount" },
                    { value: DiscountType.FIXED_AMOUNT, label: "Fixed Amount Discount" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="discountValue"
                label={discountType === DiscountType.PERCENTAGE ? "Discount (%)" : "Discount ($)"}
                rules={[
                  { required: true, message: "Please enter discount value" },
                  {
                    type: 'number',
                    min: discountType === DiscountType.PERCENTAGE ? 1 : 0.01,
                    max: discountType === DiscountType.PERCENTAGE ? 100 : undefined,
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={discountType === DiscountType.PERCENTAGE ? 1 : 0.01}
                  max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                  precision={discountType === DiscountType.PERCENTAGE ? 0 : 2}
                  addonAfter={discountType === DiscountType.PERCENTAGE ? "%" : "$"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="maxDiscountAmount"
                label="Max Discount ($)"
                tooltip="Maximum discount amount"
              >
                <InputNumber
                  className="w-full"
                  min={0.01}
                  precision={2}
                  addonAfter="$"
                  placeholder="Optional"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="minOrderValue"
                label="Minimum Order Value ($)"
                tooltip="Minimum order amount required"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  addonAfter="$"
                  placeholder="No minimum"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="usageLimit"
                label="Usage Limit"
                tooltip="Maximum number of uses"
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  precision={0}
                  placeholder="Unlimited"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="active"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleCloseModals}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                Create Voucher
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      {selectedVoucher && (
        <Modal
          title={
            <Space>
              <GiftOutlined className="text-blue-500" />
              <span>{selectedVoucher.code}</span>
              <Tag icon={getVoucherStatus(selectedVoucher).icon} color={getVoucherStatus(selectedVoucher).color}>
                {getVoucherStatus(selectedVoucher).status}
              </Tag>
            </Space>
          }
          open={isDetailModalOpen}
          onCancel={handleCloseModals}
          footer={[
            <Button key="close" onClick={handleCloseModals}>
              Close
            </Button>,
            selectedVoucher.active && getVoucherStatus(selectedVoucher).status !== "Expired" && (
              <Button
                key="deactivate"
                danger
                onClick={() => {
                  handleDeactivate(selectedVoucher.id, selectedVoucher.code);
                  handleCloseModals();
                }}
              >
                Deactivate
              </Button>
            ),
          ]}
          width={800}
        >
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Usage"
                    value={selectedVoucher.usedCount}
                    suffix={selectedVoucher.usageLimit ? `/ ${selectedVoucher.usageLimit}` : ""}
                    prefix={<CheckCircleOutlined />}
                  />
                  {selectedVoucher.usageLimit && (
                    <Progress
                      percent={Math.round((selectedVoucher.usedCount / selectedVoucher.usageLimit) * 100)}
                      strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                    />
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Discount Value"
                    value={selectedVoucher.discountValue}
                    suffix={selectedVoucher.discountType === DiscountType.PERCENTAGE ? "%" : "$"}
                    prefix={selectedVoucher.discountType === DiscountType.PERCENTAGE ? <PercentageOutlined /> : <DollarOutlined />}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Days Remaining"
                    value={Math.max(0, dayjs(selectedVoucher.endDate).diff(dayjs(), "day"))}
                    prefix={<CalendarOutlined />}
                    valueStyle={{
                      color: dayjs(selectedVoucher.endDate).diff(dayjs(), "day") < 7 ? "#cf1322" : "#1890ff",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Code" span={2}>
                <Text strong className="font-mono text-blue-600">{selectedVoucher.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Discount Type" span={2}>
                {selectedVoucher.discountType === DiscountType.PERCENTAGE ? "Percentage Discount" : "Fixed Amount Discount"}
              </Descriptions.Item>
              <Descriptions.Item label="Discount Value">
                {selectedVoucher.discountType === DiscountType.PERCENTAGE
                  ? `${selectedVoucher.discountValue}%`
                  : `$${selectedVoucher.discountValue}`}
              </Descriptions.Item>
              <Descriptions.Item label="Max Discount">
                {selectedVoucher.maxDiscountAmount ? `$${selectedVoucher.maxDiscountAmount}` : "No limit"}
              </Descriptions.Item>
              <Descriptions.Item label="Min Order Value">
                {selectedVoucher.minOrderValue ? `$${selectedVoucher.minOrderValue}` : "No minimum"}
              </Descriptions.Item>
              <Descriptions.Item label="Usage Limit">
                {selectedVoucher.usageLimit || "Unlimited"}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(selectedVoucher.startDate).format("MMMM D, YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(selectedVoucher.endDate).format("MMMM D, YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedVoucher.description}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Modal>
      )}
    </div>
  );
}
