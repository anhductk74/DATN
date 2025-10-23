"use client";

import { useState } from "react";
import { 
  Card, 
  List, 
  Avatar, 
  Badge, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Statistic,
  Tabs,
  Select,
  Typography,
  Empty
} from "antd";
import { 
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  SearchOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Message {
  id: string;
  customerName: string;
  customerAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  priority: 'low' | 'normal' | 'high';
  type: 'inquiry' | 'complaint' | 'compliment' | 'return';
}

interface Ticket {
  id: string;
  customerName: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  assignedTo?: string;
}

export default function CustomerCare() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<string>('all');
  const [ticketFilter, setTicketFilter] = useState<string>('all');

  // Mock data
  const messages: Message[] = [
    {
      id: '1',
      customerName: 'John Doe',
      customerAvatar: '/api/placeholder/40/40',
      subject: 'Question about iPhone 14 Pro warranty',
      preview: 'Hi, I recently purchased an iPhone 14 Pro from your store and I have some questions about the warranty coverage...',
      timestamp: '2 hours ago',
      status: 'unread',
      priority: 'normal',
      type: 'inquiry',
    },
    {
      id: '2',
      customerName: 'Sarah Wilson',
      customerAvatar: '/api/placeholder/40/40',
      subject: 'Damaged package received',
      preview: 'I received my order yesterday but the package was damaged during shipping. The MacBook Air box has several dents...',
      timestamp: '4 hours ago',
      status: 'read',
      priority: 'high',
      type: 'complaint',
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      customerAvatar: '/api/placeholder/40/40',
      subject: 'Excellent service!',
      preview: 'I just wanted to thank you for the amazing customer service. The delivery was super fast and the product quality is excellent...',
      timestamp: '1 day ago',
      status: 'replied',
      priority: 'low',
      type: 'compliment',
    },
    {
      id: '4',
      customerName: 'Emily Chen',
      customerAvatar: '/api/placeholder/40/40',
      subject: 'Return request for Samsung Galaxy S23',
      preview: 'I would like to return the Samsung Galaxy S23 I purchased last week. It doesn\'t meet my expectations...',
      timestamp: '2 days ago',
      status: 'read',
      priority: 'normal',
      type: 'return',
    },
  ];

  const tickets: Ticket[] = [
    {
      id: 'T001',
      customerName: 'Alice Brown',
      subject: 'Refund not processed',
      status: 'open',
      priority: 'urgent',
      category: 'Payment',
      createdAt: '2024-03-15',
      assignedTo: 'Support Team A',
    },
    {
      id: 'T002',
      customerName: 'Bob Smith',
      subject: 'Product not working as expected',
      status: 'in_progress',
      priority: 'high',
      category: 'Technical',
      createdAt: '2024-03-14',
      assignedTo: 'Support Team B',
    },
    {
      id: 'T003',
      customerName: 'Carol Davis',
      subject: 'Shipping delay inquiry',
      status: 'resolved',
      priority: 'normal',
      category: 'Logistics',
      createdAt: '2024-03-13',
      assignedTo: 'Support Team A',
    },
  ];

  const customerCareStats = [
    {
      title: 'Total Messages',
      value: messages.length,
      color: '#1890ff',
    },
    {
      title: 'Unread Messages',
      value: messages.filter(m => m.status === 'unread').length,
      color: '#f5222d',
    },
    {
      title: 'Open Tickets',
      value: tickets.filter(t => t.status === 'open').length,
      color: '#faad14',
    },
    {
      title: 'Avg Response Time',
      value: '2.5h',
      color: '#52c41a',
    },
  ];

  const statusColors = {
    unread: 'red',
    read: 'orange', 
    replied: 'green',
    open: 'red',
    in_progress: 'blue',
    resolved: 'green',
    closed: 'gray',
  };

  const priorityColors = {
    low: 'green',
    normal: 'blue',
    high: 'orange',
    urgent: 'red',
  };

  const typeColors = {
    inquiry: 'blue',
    complaint: 'red',
    compliment: 'green',
    return: 'orange',
  };

  const filteredMessages = messages.filter(message => {
    if (messageFilter === 'all') return true;
    return message.status === messageFilter || message.type === messageFilter;
  });

  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter === 'all') return true;
    return ticket.status === ticketFilter || ticket.priority === ticketFilter;
  });

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Row gutter={[16, 16]}>
        {customerCareStats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs defaultActiveKey="messages">
          <TabPane 
            tab={
              <span>
                <MessageOutlined />
                Messages
                {messages.filter(m => m.status === 'unread').length > 0 && (
                  <Badge 
                    count={messages.filter(m => m.status === 'unread').length} 
                    style={{ marginLeft: 8 }} 
                  />
                )}
              </span>
            } 
            key="messages"
          >
            <Row gutter={16}>
              <Col xs={24} lg={8}>
                {/* Message List */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search messages..."
                      prefix={<SearchOutlined />}
                      style={{ flex: 1 }}
                    />
                    <Select value={messageFilter} onChange={setMessageFilter} style={{ width: 120 }}>
                      <Option value="all">All</Option>
                      <Option value="unread">Unread</Option>
                      <Option value="read">Read</Option>
                      <Option value="replied">Replied</Option>
                      <Option value="inquiry">Inquiries</Option>
                      <Option value="complaint">Complaints</Option>
                      <Option value="compliment">Compliments</Option>
                      <Option value="return">Returns</Option>
                    </Select>
                  </div>

                  <List
                    dataSource={filteredMessages}
                    renderItem={(message) => (
                      <List.Item 
                        className={`cursor-pointer p-4 rounded-lg border mb-2 hover:bg-gray-50 ${
                          selectedMessage === message.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedMessage(message.id)}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={message.customerAvatar}>{message.customerName[0]}</Avatar>}
                          title={
                            <div className="flex items-center justify-between">
                              <span className={message.status === 'unread' ? 'font-bold' : ''}>
                                {message.customerName}
                              </span>
                              <div className="flex gap-1">
                                <Tag color={typeColors[message.type]}>
                                  {message.type}
                                </Tag>
                                <Tag color={priorityColors[message.priority]}>
                                  {message.priority}
                                </Tag>
                              </div>
                            </div>
                          }
                          description={
                            <div>
                              <div className="font-medium text-gray-900 mb-1">{message.subject}</div>
                              <div className="text-gray-600 text-sm line-clamp-2">{message.preview}</div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-400">{message.timestamp}</span>
                                <Tag color={statusColors[message.status]}>
                                  {message.status.replace('_', ' ')}
                                </Tag>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Col>
              
              <Col xs={24} lg={16}>
                {/* Message Detail */}
                {selectedMessage ? (
                  <Card title="Message Details" className="h-full">
                    <div className="space-y-4">
                      {/* Message content would go here */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Text>Message content and conversation history would be displayed here.</Text>
                      </div>
                      
                      {/* Reply Section */}
                      <div className="border-t pt-4">
                        <TextArea
                          rows={4}
                          placeholder="Type your reply..."
                          className="mb-2"
                        />
                        <div className="flex justify-between">
                          <Space>
                            <Button icon={<PhoneOutlined />}>Call Customer</Button>
                            <Button icon={<MailOutlined />}>Send Email</Button>
                          </Space>
                          <Button type="primary" icon={<SendOutlined />}>
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <Empty description="Select a message to view details" />
                  </Card>
                )}
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ExclamationCircleOutlined />
                Support Tickets
              </span>
            } 
            key="tickets"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search tickets..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                  />
                  <Select value={ticketFilter} onChange={setTicketFilter} style={{ width: 150 }}>
                    <Option value="all">All Status</Option>
                    <Option value="open">Open</Option>
                    <Option value="in_progress">In Progress</Option>
                    <Option value="resolved">Resolved</Option>
                    <Option value="closed">Closed</Option>
                  </Select>
                </div>
                <Button type="primary">Create Ticket</Button>
              </div>

              <List
                dataSource={filteredTickets}
                renderItem={(ticket) => (
                  <Card size="small" className="mb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Title level={5} className="mb-0">{ticket.subject}</Title>
                          <Tag color={statusColors[ticket.status]}>
                            {ticket.status.replace('_', ' ')}
                          </Tag>
                          <Tag color={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Tag>
                        </div>
                        <div className="text-gray-600 space-y-1">
                          <div>Customer: <strong>{ticket.customerName}</strong></div>
                          <div>Ticket ID: <strong>{ticket.id}</strong></div>
                          <div>Category: <strong>{ticket.category}</strong></div>
                          <div>Created: <strong>{ticket.createdAt}</strong></div>
                          {ticket.assignedTo && (
                            <div>Assigned to: <strong>{ticket.assignedTo}</strong></div>
                          )}
                        </div>
                      </div>
                      <Space>
                        <Button size="small">View Details</Button>
                        <Button size="small" type="primary">Update</Button>
                      </Space>
                    </div>
                  </Card>
                )}
              />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                Response Templates
              </span>
            } 
            key="templates"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <Title level={4}>Quick Response Templates</Title>
                <Button type="primary">Add Template</Button>
              </div>
              
              <Row gutter={[16, 16]}>
                {[
                  { title: 'Order Status Inquiry', category: 'Shipping' },
                  { title: 'Return Process', category: 'Returns' },
                  { title: 'Product Information', category: 'General' },
                  { title: 'Technical Support', category: 'Technical' },
                ].map((template, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card size="small" hoverable>
                      <div className="text-center">
                        <div className="font-medium mb-2">{template.title}</div>
                        <Tag>{template.category}</Tag>
                        <div className="mt-3">
                          <Button size="small">Use Template</Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}