"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Badge, App } from "antd";
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
  LoadingOutlined,
  WalletOutlined,
  TagOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { MenuProps } from "antd";
import Link from "next/link";
import { shopService, Shop } from "@/services";

const { Sider, Header, Content } = Layout;

interface ShopLayoutProps {
  children: React.ReactNode;
}

function ShopLayoutContent({ children }: ShopLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { userProfile } = useUserProfile();
  const { message } = App.useApp();
  
  // Shop state
  const [userShop, setUserShop] = useState<Shop | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Check if user has a shop
  useEffect(() => {
    const checkUserShop = async () => {
      if (!userProfile?.id) {
        setLoadingShop(false);
        setHasChecked(true);
        return;
      }

      try {
        const response = await shopService.getShopsByOwner(userProfile.id);
        if (response.data && response.data.length > 0) {
          setUserShop(response.data[0]);
        } else {
          setUserShop(null);
          // Redirect immediately if not on create page
          if (!pathname.includes('/create')) {
            router.replace('/shop-management/create');
          }
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
        setUserShop(null);
        if (!pathname.includes('/create')) {
          router.replace('/shop-management/create');
        }
      } finally {
        setLoadingShop(false);
        setHasChecked(true);
      }
    };

    checkUserShop();
  }, [userProfile?.id, pathname, router]);

  // If loading or not checked yet, show loading state
  if (loadingShop || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingOutlined className="text-5xl text-blue-500 mb-4" />
          <p className="text-gray-600">Loading shop information...</p>
        </div>
      </div>
    );
  }

  // If on create page, let it render
  if (pathname.includes('/create')) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // If no shop (should have redirected already, but show nothing to prevent flash)
  if (!userShop) {
    return null;
  }

  // User has shop - render management layout

  // Menu items with English labels
  const menuItems = [
    {
      key: "/shop-management/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/shop-management/wallet",
      icon: <WalletOutlined />,
      label: "Wallet",
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Order Management",
      children: [
        {
          key: "/shop-management/orders",
          label: "All Orders",
        },
        {

          key: "/shop-management/orders/pending-orders",

          label: "Pending Orders",
        },
        {
          key: "/shop-management/orders/processing",
          label: "Processing",
        },
        {

          key: "/shop-management/orders/shipping",
          label: "Shipping",

        },
        {
          key: "/shop-management/orders/delivered",
          label: "Delivered",
        },
        {
          key: "/shop-management/orders/cancelled",
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
          key: "/shop-management/products/all",
          label: "All Products",
        },
        {
          key: "/shop-management/products/add",
          label: "Add Product",
        },
        {
          key: "/shop-management/products/categories",
          label: "Categories",
        },
        {
          key: "/shop-management/products/inventory",
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
          key: "/shop-management/profile",
          icon: <UserOutlined />,
          label: "Shop Profile",
        },
        {
          key: "/shop-management/return-requests",
          icon: <FileTextOutlined />,
          label: "Return Requests",
        },
        {
          key: "/shop-management/reviews",
          icon: <StarOutlined />,
          label: "Reviews & Ratings",
        },
      ],
    },
    {
      key: "/shop-management/messages",
      icon: <MessageOutlined />,
      label: "Messages",
    },
    {
      key: "/shop-management/vouchers",
      icon: <GiftOutlined />,
      label: "Voucher Management",
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
      onClick: () => router.push('/shop-management/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/shop-management/settings'),
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
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 flex-shrink-0">
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

        {/* Menu with custom scrollbar */}
        <div 
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          className="scrollbar-hide"
        >
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
        </div>
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
                {pathname === '/shop-management' ? 'Dashboard' : 
                 pathname === '/shop-management/dashboard' ? 'Dashboard' :
                 pathname === '/shop-management/wallet' ? 'Wallet Management' :
                 pathname.includes('/orders') ? 'Order Management' :
                 pathname.includes('/products') ? 'Product Management' :
                 pathname.includes('/profile') ? 'Shop Profile' :
                 pathname.includes('/complaints') ? 'Complaint Management' :
                 pathname.includes('/messages') ? 'Customer Care' :
                 pathname.includes('/vouchers') ? 'Voucher Management' : 'Shop Management'}
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

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <App>
      <ShopLayoutContent>{children}</ShopLayoutContent>
    </App>
  );
}