'use client';

import { useSession } from 'next-auth/react';
import { 
  Card, 
  Row, 
  Col, 
  Descriptions, 
  Typography,
  Tag,
  Space,
  Divider,
  Statistic,
  Alert
} from 'antd';
import {
  ShopOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  CarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function CompanyPage() {
  const { data: session } = useSession();

  if (!session?.user?.company) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Không có thông tin công ty"
          description="Bạn chưa được gán vào công ty nào. Vui lòng liên hệ quản trị viên."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const company = session.user.company;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ShopOutlined /> Thông tin công ty
        </Title>
        <Text type="secondary">
          Thông tin chi tiết về công ty vận chuyển của bạn
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Company Overview Card */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <ShopOutlined />
                <span>Thông tin chung</span>
              </Space>
            }
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên công ty" span={2}>
                <Text strong style={{ fontSize: '16px' }}>
                  {company.companyName}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Mã công ty">
                <Tag color="blue" style={{ fontSize: '14px' }}>
                  {company.companyCode}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Đang hoạt động
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Email liên hệ" span={2}>
                <Space>
                  <MailOutlined />
                  <Text copyable>{company.contactEmail}</Text>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Số điện thoại" span={2}>
                <Space>
                  <PhoneOutlined />
                  <Text copyable>{company.contactPhone}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <Space>
                <EnvironmentOutlined />
                Địa chỉ trụ sở
              </Space>
            </Divider>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Số nhà, đường" span={2}>
                <Text>{company.street}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Phường/Xã">
                <Text>{company.commune}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Quận/Huyện">
                <Tag color="processing">{company.district}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Tỉnh/Thành phố">
                <Tag color="success">{company.city}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Địa chỉ đầy đủ" span={2}>
                <Space>
                  <EnvironmentOutlined />
                  <Text copyable strong>
                    {company.fullAddress}
                  </Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Additional Information */}
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                <span>Thông tin bổ sung</span>
              </Space>
            }
            style={{ marginTop: 24 }}
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Khu vực hoạt động chính">
                <Tag color="blue">{company.district}</Tag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Shipper chỉ có thể hoạt động trong khu vực này
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Vai trò của bạn">
                <Tag color="gold">MANAGER</Tag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Quản lý shipper, đơn hàng và báo cáo
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Mô tả">
                <Text>
                  Công ty vận chuyển hoạt động tại {company.city}, chuyên cung cấp 
                  dịch vụ giao hàng nhanh và đáng tin cậy trong khu vực {company.district}.
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Statistics Cards */}
        <Col xs={24} lg={8}>
          <Card>
            <Statistic
              title="Tổng số Shipper"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Shipper đang hoạt động
            </Text>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <Statistic
              title="Đơn hàng hôm nay"
              value={0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Đơn hàng đang xử lý
            </Text>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <Statistic
              title="Kho hàng"
              value={0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Kho đang hoạt động
            </Text>
          </Card>

          {/* Manager Info */}
          <Card
            title="Thông tin Manager"
            style={{ marginTop: 16 }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Họ tên">
                <Text strong>{session?.user?.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text copyable>{session?.user?.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {session?.user?.phoneNumber || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color="blue">MANAGER</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Quick Actions */}
          <Card
            title="Lưu ý"
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Alert
                message="Khu vực quản lý"
                description={`Bạn chỉ có thể tạo và quản lý shipper hoạt động trong ${company.district}`}
                type="info"
                showIcon
                icon={<EnvironmentOutlined />}
              />
              
              <Alert
                message="Quyền hạn"
                description="Bạn có quyền quản lý shipper, đơn hàng, kho và xem báo cáo của công ty"
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
