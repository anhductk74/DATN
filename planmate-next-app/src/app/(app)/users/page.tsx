'use client';

import React, { useState } from 'react';
import { Card, Table, Button, Tag, Avatar, Space, Modal, Form, Input, Select, Switch, message } from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useAuth } from '@/components/AuthProvider';
import { mockUsers } from '@/lib/mockAuth';
import { UserRole } from '@/types/auth';

const { Option } = Select;

export default function UserManagementPage() {
  const { user, hasPermission, getRoleDisplayName } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: '#ff4d4f',
      [UserRole.PROJECT_MANAGER]: '#1890ff',
      [UserRole.TEAM_LEAD]: '#52c41a',
      [UserRole.TEAM_MEMBER]: '#faad14'
    };
    return colors[role];
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: any) => (
        <Space>
          <Avatar src={record.avatar} size={40} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {getRoleDisplayName(role)}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" />
          {hasPermission('users', 'update') && (
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEdit(record)}
            />
          )}
          {hasPermission('users', 'delete') && record.id !== user?.id && (
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const handleEdit = (userRecord: any) => {
    setEditingUser(userRecord);
    form.setFieldsValue(userRecord);
    setModalVisible(true);
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user?',
      onOk: () => {
        setUsers(users.filter(u => u.id !== userId));
        message.success('User deleted successfully');
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === (editingUser as any).id ? { ...u, ...values } : u));
      message.success('User updated successfully');
    } else {
      // Create new user
      const newUser = {
        ...values,
        id: Date.now().toString(),
        joinedAt: new Date(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.name}`,
      };
      setUsers([...users, newUser]);
      message.success('User created successfully');
    }
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // Check permissions
  if (!hasPermission('users', 'read')) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
        <p>You don't have permission to view user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage system users, roles and permissions
          </p>
        </div>
        {hasPermission('users', 'create') && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add New User
          </Button>
        )}
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select user role">
              {Object.values(UserRole).map(role => (
                <Option key={role} value={role}>
                  <Tag color={getRoleColor(role)}>
                    {getRoleDisplayName(role)}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>

          <Form.Item name="isActive" label="Active Status" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
