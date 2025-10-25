"use client";

import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from "antd";
import {
  ShopOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  BoxPlotOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  StarOutlined,
  MessageOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { MenuProps } from "antd";
import Link from "next/link";

const { Sider, Header, Content } = Layout;

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { userProfile } = useUserProfile();

  // Menu items with English labels
  const menuItems = [
    {
      key: "/shop",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Order Management",
      children: [
        {
          key: "/shop/orders",
          label: "All Orders",
        },
        {
          key: "/shop/orders/pending",
          label: "Pending Orders",
        },
        {
          key: "/shop/orders/processing",
          label: "Processing",
        },
        {
          key: "/shop/orders/shipped",
          label: "Shipped",
        },
        {
          key: "/shop/orders/delivered",
          label: "Delivered",
        },
        {
          key: "/shop/orders/cancelled",
          label: "Cancelled",
        },
      ],
    },
    {
      key: "products",
      icon: <BoxPlotOutlined />,
      label: "Product Management",
      children: [
        {
          key: "/shop/products/all",
          label: "All Products",
        },
        {
          key: "/shop/products/add",
          label: "Add Product",
        },
        {
          key: "/shop/products/categories",
          label: "Categories",
        },
        {
          key: "/shop/products/inventory",
          label: "Inventory",
        },
      ],
    },
    {
      key: "shop-management",
      icon: <ShopOutlined />,
      label: "Shop Management",
      children: [
        {
          key: "/shop/profile",
          icon: <UserOutlined />,
          label: "Shop Profile",
        },
        {
          key: "/shop/complaints",
          icon: <FileTextOutlined />,
          label: "Complaint Management",
        },
        {
          key: "/shop/reviews",
          icon: <StarOutlined />,
          label: "Reviews & Ratings",
        },
      ],
    },
    {
      key: "customer-care",
      icon: <CustomerServiceOutlined />,
      label: "Customer Care",
      children: [
        {
          key: "/shop/messages",
          icon: <MessageOutlined />,
          label: "Messages",
        },
        {
          key: "/shop/support",
          icon: <CustomerServiceOutlined />,
          label: "Support Tickets",
        },
      ],
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
      children: [
        {
          key: "/shop/analytics/sales",
          label: "Sales Report",
        },
        {
          key: "/shop/analytics/products",
          label: "Product Analytics",
        },
        {
          key: "/shop/analytics/customers",
          label: "Customer Analytics",
        },
      ],
    },
  ];

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Shop Profile',
      onClick: () => router.push('/shop/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/shop/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        signOut();
        router.push('/');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          background: '#fff',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ShopOutlined className="text-white text-lg" />
              </div>
              <span className="text-lg font-bold text-gray-800">Shop Center</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShopOutlined className="text-white text-lg" />
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ 
            borderRight: 0, 
            background: 'transparent',
            fontSize: '14px',
          }}
          items={menuItems.map(item => ({
            ...item,
            onClick: item.children ? undefined : () => handleMenuClick(item.key),
            children: item.children?.map(child => ({
              ...child,
              onClick: () => handleMenuClick(child.key),
            })),
          }))}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 280,
            zIndex: 99,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '0 24px',
            transition: 'all 0.2s',
          }}
        >
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center w-8 h-8"
              />
              <h1 className="text-xl font-semibold text-gray-800 m-0">
                {pathname === '/shop' ? 'Dashboard' : 
                 pathname.includes('/orders') ? 'Order Management' :
                 pathname.includes('/products') ? 'Product Management' :
                 pathname.includes('/profile') ? 'Shop Profile' :
                 pathname.includes('/complaints') ? 'Complaint Management' :
                 pathname.includes('/messages') ? 'Customer Care' :
                 pathname.includes('/analytics') ? 'Analytics' : 'Shop Management'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Badge count={5}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="flex items-center justify-center w-10 h-10"
                />
              </Badge>

              {/* User Menu */}
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                  <Avatar 
                    size={32} 
                    src={userProfile?.avatar} 
                    icon={<UserOutlined />}
                    className="bg-blue-500"
                  />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {userProfile?.fullName || 'Shop Owner'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {userProfile?.email}
                      </span>
                    </div>
                  )}
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            marginTop: 64,
            padding: '24px',
            minHeight: 'calc(100vh - 64px)',
            background: '#f5f5f5',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}