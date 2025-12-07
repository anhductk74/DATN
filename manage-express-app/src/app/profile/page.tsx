'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Button, 
  Descriptions, 
  Modal, 
  Form, 
  Input, 
  Select,
  Upload,
  message,
  Divider,
  Tag,
  Space,
  Typography,
  Spin
} from 'antd';
import type { UploadProps } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.avatar);

  useEffect(() => {
    if (session?.user) {
      setAvatarUrl(session.user.avatar);
    }
  }, [session]);

  const handleEdit = () => {
    form.setFieldsValue({
      fullName: session?.user?.fullName,
      phoneNumber: session?.user?.phoneNumber,
      email: session?.user?.email,
      gender: session?.user?.gender,
      dateOfBirth: session?.user?.dateOfBirth,
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async (values: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
  }) => {
    setLoading(true);
    try {
      // TODO: Call API to update profile
      // const response = await userService.updateProfile(values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
        }
      });

      message.success('Cập nhật thông tin thành công');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      setLoading(false);
      setAvatarUrl(info.file.response?.url);
      message.success('Cập nhật ảnh đại diện thành công');
    }
  };

  if (!session?.user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const user = session.user;
  const company = user.company;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Thông tin cá nhân</Title>
      
      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  src={avatarUrl}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <Upload
                  name="avatar"
                  showUploadList={false}
                  action="/api/upload/avatar"
                  onChange={handleAvatarChange}
                  disabled
                >
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="small"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                    }}
                  />
                </Upload>
              </div>
              
              <Title level={4} style={{ marginBottom: 4 }}>
                {user.fullName || user.username}
              </Title>
              
              <Space direction="vertical" size={2}>
                <Tag color="blue" style={{ marginBottom: 8 }}>
                  {user.roles?.includes('MANAGER') ? 'QUẢN LÝ' : 'USER'}
                </Tag>
                <Text type="secondary">
                  <MailOutlined /> {user.email || user.username}
                </Text>
                {user.phoneNumber && (
                  <Text type="secondary">
                    <PhoneOutlined /> {user.phoneNumber}
                  </Text>
                )}
              </Space>

              <Divider />

              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
                block
              >
                Chỉnh sửa thông tin
              </Button>
            </div>
          </Card>

          {/* Company Info Card */}
          {company && (
            <Card 
              title={
                <Space>
                  <ShopOutlined />
                  <span>Thông tin công ty</span>
                </Space>
              }
              style={{ marginTop: 24 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên công ty">
                  <Text strong>{company.companyName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã công ty">
                  <Tag color="green">{company.companyCode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{company.contactEmail}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <Text copyable>{company.contactPhone}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Detailed Information */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin chi tiết">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Họ và tên" span={2}>
                <Text strong>{user.fullName || 'Chưa cập nhật'}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  {user.email || user.username}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Số điện thoại">
                <Space>
                  <PhoneOutlined />
                  {user.phoneNumber || 'Chưa cập nhật'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Giới tính">
                <Space>
                  {user.gender === 'MALE' ? <ManOutlined /> : user.gender === 'FEMALE' ? <WomanOutlined /> : <UserOutlined />}
                  {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày sinh">
                <Space>
                  <CalendarOutlined />
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag color={user.isActive ? 'success' : 'error'}>
                  {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Vai trò">
                <Space>
                  {user.roles?.map(role => (
                    <Tag color="blue" key={role}>
                      {role === 'MANAGER' ? 'QUẢN LÝ' : role}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {/* Company Address */}
            {company && (
              <>
                <Divider orientation="left">
                  <Space>
                    <EnvironmentOutlined />
                    Địa chỉ công ty
                  </Space>
                </Divider>
                
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Địa chỉ đường">
                    <Text>{company.street}</Text>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Phường/Xã">
                    <Text>{company.commune}</Text>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Quận/Huyện">
                    <Tag color="blue">{company.district}</Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Tỉnh/Thành phố">
                    <Tag color="green">{company.city}</Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Địa chỉ đầy đủ" span={2}>
                    <Text copyable>
                      <EnvironmentOutlined /> {company.fullAddress}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>

          {/* Security Card */}
          <Card 
            title="Bảo mật tài khoản" 
            style={{ marginTop: 24 }}
            extra={
              <Button type="link" disabled>
                Đổi mật khẩu
              </Button>
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Tên đăng nhập">
                <Text code>{user.username || user.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mật khẩu">
                <Text type="secondary">••••••••</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="Nguyễn Văn A"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />}
              placeholder="0912345678"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
          >
            <Input 
              prefix={<MailOutlined />}
              disabled
              placeholder="email@example.com"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                icon={<CloseOutlined />}
                onClick={() => setEditModalVisible(false)}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
