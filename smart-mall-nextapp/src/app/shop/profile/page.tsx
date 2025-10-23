"use client";

import { useState } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Row, 
  Col, 
  Avatar, 
  Typography,
  Divider,
  Switch,
  TimePicker,
  Select,
  Tag,
  Space,
  Rate,
  Progress
} from "antd";
import { 
  EditOutlined,
  CameraOutlined,
  SaveOutlined,
  StarFilled,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ShopProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Mock shop data
  const shopData = {
    name: "TechWorld Electronics",
    description: "Your trusted partner for the latest electronic gadgets and accessories. We offer premium quality products with excellent customer service.",
    logo: "/api/placeholder/150/150",
    banner: "/api/placeholder/800/300",
    email: "contact@techworld.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, Digital City, TC 12345",
    website: "https://techworld.com",
    category: "Electronics",
    established: "2020",
    rating: 4.8,
    totalReviews: 1234,
    followers: 15670,
    responseTime: "2 hours",
    policies: {
      returnPolicy: "30-day return policy",
      shippingPolicy: "Free shipping on orders over $50",
      warranty: "1-year manufacturer warranty"
    },
    businessHours: {
      monday: { start: dayjs('09:00', 'HH:mm'), end: dayjs('18:00', 'HH:mm'), isOpen: true },
      tuesday: { start: dayjs('09:00', 'HH:mm'), end: dayjs('18:00', 'HH:mm'), isOpen: true },
      wednesday: { start: dayjs('09:00', 'HH:mm'), end: dayjs('18:00', 'HH:mm'), isOpen: true },
      thursday: { start: dayjs('09:00', 'HH:mm'), end: dayjs('18:00', 'HH:mm'), isOpen: true },
      friday: { start: dayjs('09:00', 'HH:mm'), end: dayjs('18:00', 'HH:mm'), isOpen: true },
      saturday: { start: dayjs('10:00', 'HH:mm'), end: dayjs('16:00', 'HH:mm'), isOpen: true },
      sunday: { start: dayjs('10:00', 'HH:mm'), end: dayjs('16:00', 'HH:mm'), isOpen: false },
    }
  };

  const handleSave = (values: any) => {
    console.log('Saving shop profile:', values);
    setIsEditing(false);
    // Here you would typically call an API to update the shop profile
  };

  const uploadButton = (
    <div>
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <Card>
        <div className="relative">
          {/* Banner */}
          <div 
            className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"
            style={{
              backgroundImage: `url(${shopData.banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {isEditing && (
              <div className="absolute top-4 right-4">
                <Upload showUploadList={false}>
                  <Button icon={<CameraOutlined />}>Change Banner</Button>
                </Upload>
              </div>
            )}
          </div>
          
          {/* Shop Info */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar size={120} src={shopData.logo} />
              {isEditing && (
                <div className="absolute bottom-0 right-0">
                  <Upload showUploadList={false}>
                    <Button size="small" shape="circle" icon={<CameraOutlined />} />
                  </Upload>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Title level={2} className="mb-0">{shopData.name}</Title>
                <Button 
                  type={isEditing ? "default" : "primary"}
                  icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                  onClick={() => isEditing ? form.submit() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <StarFilled className="text-yellow-500" />
                  <span className="font-medium">{shopData.rating}</span>
                  <span className="text-gray-500">({shopData.totalReviews} reviews)</span>
                </div>
                <Tag color="blue">{shopData.category}</Tag>
                <div className="flex items-center gap-1 text-gray-500">
                  <EyeOutlined />
                  <span>{shopData.followers} followers</span>
                </div>
              </div>
              
              <Text className="text-gray-600">{shopData.description}</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Shop Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{shopData.totalReviews}</div>
              <div className="text-gray-500">Total Reviews</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{shopData.followers}</div>
              <div className="text-gray-500">Followers</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{shopData.responseTime}</div>
              <div className="text-gray-500">Avg Response Time</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Shop Details Form */}
        <Col xs={24} lg={16}>
          <Card title="Shop Information">
            <Form
              form={form}
              layout="vertical"
              initialValues={shopData}
              onFinish={handleSave}
              disabled={!isEditing}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Shop Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Electronics">Electronics</Option>
                      <Option value="Fashion">Fashion</Option>
                      <Option value="Home">Home & Garden</Option>
                      <Option value="Sports">Sports & Outdoors</Option>
                      <Option value="Books">Books</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <TextArea rows={4} placeholder="Tell customers about your shop..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Address">
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>

              <Form.Item name="website" label="Website">
                <Input placeholder="https://yourwebsite.com" />
              </Form.Item>

              <Divider>Business Hours</Divider>

              {Object.entries(shopData.businessHours).map(([day, hours]) => (
                <Row key={day} gutter={16} className="mb-2">
                  <Col span={6}>
                    <div className="flex items-center h-8">
                      <span className="capitalize font-medium">{day}</span>
                    </div>
                  </Col>
                  <Col span={4}>
                    <Form.Item name={[`businessHours`, day, 'isOpen']} valuePropName="checked">
                      <Switch size="small" />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item name={[`businessHours`, day, 'start']}>
                      <TimePicker format="HH:mm" size="small" disabled={!hours.isOpen} />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item name={[`businessHours`, day, 'end']}>
                      <TimePicker format="HH:mm" size="small" disabled={!hours.isOpen} />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </Form>
          </Card>
        </Col>

        {/* Shop Policies & Performance */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" className="w-full">
            {/* Policies */}
            <Card title="Shop Policies" size="small">
              <div className="space-y-3">
                <div>
                  <Text strong>Return Policy:</Text>
                  <div className="text-sm text-gray-600">{shopData.policies.returnPolicy}</div>
                </div>
                <div>
                  <Text strong>Shipping Policy:</Text>
                  <div className="text-sm text-gray-600">{shopData.policies.shippingPolicy}</div>
                </div>
                <div>
                  <Text strong>Warranty:</Text>
                  <div className="text-sm text-gray-600">{shopData.policies.warranty}</div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card title="Performance Metrics" size="small">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">96%</span>
                  </div>
                  <Progress percent={96} strokeColor="#52c41a" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">On-time Delivery</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <Progress percent={94} strokeColor="#1890ff" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Response Rate</span>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                  <Progress percent={98} strokeColor="#722ed1" />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions" size="small">
              <div className="space-y-2">
                <Button block size="small">View Public Profile</Button>
                <Button block size="small">Download Shop Report</Button>
                <Button block size="small">Manage Policies</Button>
                <Button block size="small">Contact Support</Button>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}