"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  SearchOutlined, 
  HeartOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  BellOutlined,
  DownOutlined,
  MenuOutlined,
  HomeOutlined,
  TagOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { Drawer, List, Button, Divider, Badge, InputNumber } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItem } from "@/contexts/CartContext";
import { useAntdApp } from "@/hooks/useAntdApp";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useCart } from "@/contexts/CartContext";
import { getCloudinaryUrl } from "@/config/config";
import Image from "next/image";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { message } = useAntdApp();
  const { userProfile } = useUserProfile();
  const cart = useCart();

  // Use enhanced user profile with priority to API data, fallback to session
  // But preserve avatar/image from session if API doesn't have it
  const currentUser = userProfile || user;
  const sessionUser = user as any; // NextAuth user may have 'image' field
  const mergedUser = currentUser ? {
    ...currentUser,
    // Preserve avatar/image from session if API user doesn't have avatar
    avatar: userProfile?.avatar || sessionUser?.image || sessionUser?.avatar,
    // Also add image field for compatibility
    image: userProfile?.avatar || sessionUser?.image || sessionUser?.avatar
  } : null;

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #ORD001 has been shipped',
      timestamp: '2 hours ago',
      isRead: false,
      type: 'order',
      icon: <ShoppingCartOutlined className="text-green-500" />,
    },
    {
      id: '2',
      title: 'Flash Sale Alert! 🔥',
      message: '50% OFF on Electronics! Limited time',
      timestamp: '4 hours ago',
      isRead: false,
      type: 'promotion',
      icon: <TagOutlined className="text-orange-500" />,
    },
    {
      id: '3',
      title: 'Payment Confirmed',
      message: 'Payment for order #ORD003 confirmed',
      timestamp: '1 day ago',
      isRead: true,
      type: 'order',
      icon: <ShoppingCartOutlined className="text-blue-500" />,
    },
    {
      id: '4',
      title: 'New Voucher Available',
      message: 'Get $20 OFF with code SAVE20',
      timestamp: '2 days ago',
      isRead: true,
      type: 'promotion',
      icon: <TagOutlined className="text-purple-500" />,
    },
  ];

  const unreadNotifications = mockNotifications.filter(n => !n.isRead);
  
  // helper: resolve avatar from both Google users (image field) and registered users (avatar field)
  const resolveAvatar = (user: any) => {
    // For Google users, use the 'image' field
    if (user?.image) {

      return user.image; // Google avatars are already full URLs
    }
    
    // For registered users, use the 'avatar' field
    if (user?.avatar) {
    
      return getCloudinaryUrl(user.avatar);
    }
    
    console.log('No avatar found for user');
    return undefined;
  };
  
  // Debug: Log current user data

  const handleLogoutClick = async () => {
    setShowUserMenu(false);
    setIsLoggingOut(true);
    try {
      // Sign out from NextAuth
      await signOut({ redirect: false });
      
      message.success("Logout successful!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Logout failed!");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAuthAction = () => {
    if (mergedUser) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };

  // unified navigation helper: if route requires auth and user not logged in -> go to login
  const handleNavigate = (path: string, requiresAuth = true) => {
    if (requiresAuth && !mergedUser) {
      message.info("Please login to continue");
      router.push("/login");
      return;
    }
    router.push(path);
  };

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
      if (!target.closest('.cart-popup-container')) {
        setShowCartPopup(false);
      }
      if (!target.closest('.notification-popup-container')) {
        setShowNotificationPopup(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  

  return (
    <>
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" role="button" tabIndex={0} onClick={() => handleNavigate('/home', false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate('/home', false); }}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartMall
            </span>
          </div>

          {/* Search Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search products, brands, and more..."
                className="w-full px-6 py-4 pl-14 pr-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-300 group-hover:shadow-md"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <SearchOutlined className="text-white text-sm" />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {mergedUser && (
              <>
                {/* Notifications */}
                <div className="relative notification-popup-container">
                  <button
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNavigate('/notifications')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate('/notifications'); }}
                    onMouseEnter={() => setShowNotificationPopup(true)}
                    onMouseLeave={() => setShowNotificationPopup(false)}
                    className="relative p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md group"
                  >
                    <BellOutlined className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Popup */}
                  {showNotificationPopup && (
                    <div 
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50"
                      onMouseEnter={() => setShowNotificationPopup(true)}
                      onMouseLeave={() => setShowNotificationPopup(false)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold text-gray-900">Notifications</div>
                        <Badge count={unreadNotifications.length} size="small" />
                      </div>
                      
                      <div className="max-h-80 overflow-auto">
                        {mockNotifications.slice(0, 4).map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
                              !notification.isRead 
                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setShowNotificationPopup(false);
                              handleNavigate('/notifications');
                            }}
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              {notification.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-400">
                                {notification.timestamp}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Divider className="my-3" />
                      <div className="flex justify-between">
                        <Button 
                          size="small" 
                          type="text"
                          onClick={() => {
                            setShowNotificationPopup(false);
                            // Mark all as read logic here
                          }}
                        >
                          Mark all read
                        </Button>
                        <Button 
                          size="small" 
                          type="primary"
                          onClick={() => {
                            setShowNotificationPopup(false);
                            handleNavigate('/notifications');
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 border-none"
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigate('/wishlist')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate('/wishlist'); }}
                  className="relative p-3 text-gray-600 hover:text-pink-600 transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 hover:shadow-md group"
                >
                  <HeartOutlined className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">3</span>
                </button>
                
                {/* Cart (hover to preview, click to open /cart) */}
                <div className="relative cart-popup-container">
                  <button
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNavigate('/cart')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate('/cart'); }}
                    onMouseEnter={() => setShowCartPopup(true)}
                    onMouseLeave={() => setShowCartPopup(false)}
                    className="relative p-3 text-gray-600 hover:text-green-600 transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:shadow-md group"
                  >
                    <ShoppingCartOutlined className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">{cart.totalCount}</span>
                  </button>

                  {showCartPopup && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50" onMouseEnter={() => setShowCartPopup(true)} onMouseLeave={() => setShowCartPopup(false)}>
                      <div className="text-sm font-semibold mb-2">Cart ({cart.totalCount})</div>
                      <div className="max-h-60 overflow-auto">
                        {cart.items.length === 0 ? (
                          <div className="text-sm text-gray-500 py-6 text-center">Your cart is empty</div>
                        ) : (
                          <List dataSource={cart.items} renderItem={(item: CartItem) => (
                            <List.Item className="p-2">
                              <div className="flex items-center w-full">
                                <div className="w-12 h-12 bg-gray-100 mr-3 flex-shrink-0">
                                  {item.image ? (
                                    <Image src={getCloudinaryUrl(item.image)} alt={item.title} width={48} height={48} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium truncate">{item.title}</div>
                                  <div className="text-xs text-gray-500">{item.shopName || ''}</div>
                                </div>
                                <div className="ml-3 text-sm font-semibold text-red-600">{item.price.toLocaleString()}đ</div>
                              </div>
                            </List.Item>
                          )} />
                        )}
                      </div>
                      <Divider />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Total</div>
                          <div className="text-lg font-bold">{cart.totalPrice.toLocaleString()}đ</div>
                        </div>
                        <div className="space-x-2">
                          <Button size="small" onClick={() => handleNavigate('/cart')}>
                            View Cart
                          </Button>
                          <Button size="small" type="primary" onClick={() => handleNavigate('/checkout')}>
                            Checkout
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User Menu or Login Button */}
            {mergedUser ? (
              <div className="relative user-menu-container">
                <button 
                  className="flex items-center space-x-3 px-3 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 overflow-hidden">
                    {resolveAvatar(mergedUser) ? (
                      <Image 
                        src={resolveAvatar(mergedUser) as string} 
                        alt="Avatar" 
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Avatar image failed to load:', resolveAvatar(mergedUser));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <UserOutlined className="text-white text-lg" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                      {mergedUser.fullName || mergedUser.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      My Account
                    </span>
                  </div>
                  <DownOutlined className={`text-gray-400 text-xs transition-all duration-300 group-hover:text-blue-600 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 py-3 z-[9999] animate-in slide-in-from-top-2 duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-t-3xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                          {resolveAvatar(mergedUser) ? (
                            <Image 
                              src={resolveAvatar(mergedUser) as string} 
                              alt="Avatar" 
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Dropdown avatar image failed to load:', resolveAvatar(mergedUser));
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <UserOutlined className="text-white text-xl" />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{mergedUser.fullName || mergedUser.email?.split('@')[0]}</p>
                          <p className="text-sm text-gray-600 truncate">{mergedUser.email}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <button 
                        onClick={() => handleNavigate('/profile')}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <UserOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-blue-700">My Profile</span>
                      </button>
                      <button onClick={() => handleNavigate('/my-orders')} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-2xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <TagOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-green-700">My Orders</span>
                      </button>
                      <button 
                        onClick={() => handleNavigate('/shop')}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 rounded-2xl transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <HeartOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-pink-700">My Shop</span>
                      </button>
                      <button onClick={() => handleNavigate('/support', false)} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 rounded-2xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <CustomerServiceOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-purple-700">Support</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 my-3 mx-4"></div>
                    <div className="px-2 pb-2">
                      <button 
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className={`flex items-center w-full text-left px-4 py-3 text-sm transition-all duration-300 group rounded-2xl border border-transparent shadow-md ${
                          isLoggingOut 
                            ? "bg-gray-100 cursor-not-allowed opacity-70" 
                            : "hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-200 hover:shadow-md"
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 transition-all duration-300 shadow-lg ${
                          isLoggingOut ? "opacity-70" : "group-hover:scale-110 group-hover:rotate-3"
                        }`}>
                          {isLoggingOut ? (
                            <LoadingOutlined className="text-white text-lg animate-spin" />
                          ) : (
                            <LogoutOutlined className="text-white text-lg" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold transition-colors ${
                            isLoggingOut ? "text-gray-500" : "text-gray-800 group-hover:text-red-700"
                          }`}>
                            {isLoggingOut ? "Signing Out..." : "Sign Out"}
                          </div>
                          <div className={`text-xs transition-colors ${
                            isLoggingOut ? "text-gray-400" : "text-gray-500 group-hover:text-red-500"
                          }`}>
                            {isLoggingOut ? "Please wait..." : "Click to logout instantly"}
                          </div>
                        </div>
                        <div className={`transition-all duration-300 ${
                          isLoggingOut ? "text-gray-400" : "text-gray-400 group-hover:text-red-500 group-hover:translate-x-1"
                        }`}>
                          {isLoggingOut ? "..." : "→"}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => handleNavigate('/login', false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <MenuOutlined className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {mergedUser ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    {resolveAvatar(mergedUser) ? (
                      <Image 
                        src={resolveAvatar(mergedUser) as string} 
                        alt="Avatar" 
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Mobile avatar image failed to load:', resolveAvatar(mergedUser));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <UserOutlined className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{mergedUser.fullName || mergedUser.email?.split('@')[0]}</p>
                    <p className="text-sm text-gray-500">{mergedUser.email}</p>
                  </div>
                </div>
                
                <button onClick={() => handleNavigate('/home', false)} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <HomeOutlined className="mr-3 text-gray-400" />
                  Home
                </button>
                <button onClick={() => handleNavigate('/profile')} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <UserOutlined className="mr-3 text-gray-400" />
                  Account
                </button>
                <button onClick={() => handleNavigate('/orders')} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <TagOutlined className="mr-3 text-gray-400" />
                  Orders
                </button>
                <button onClick={() => handleNavigate('/wishlist')} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <HeartOutlined className="mr-3 text-gray-400" />
                  Wishlist
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>
                <button onClick={() => handleNavigate('/cart')} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <ShoppingCartOutlined className="mr-3 text-gray-400" />
                  Cart
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
                </button>
                <button onClick={() => handleNavigate('/support', false)} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <CustomerServiceOutlined className="mr-3 text-gray-400" />
                  Support
                </button>
                
                <div className="border-t border-gray-200 my-2"></div>
                <button 
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                    isLoggingOut 
                      ? "text-gray-400 cursor-not-allowed opacity-70" 
                      : "text-red-600 hover:bg-gray-50"
                  }`}
                >
                  {isLoggingOut ? (
                    <LoadingOutlined className="mr-3 text-gray-400 animate-spin" />
                  ) : (
                    <LogoutOutlined className="mr-3 text-red-500" />
                  )}
                  {isLoggingOut ? "Signing Out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <HomeOutlined className="mr-3 text-gray-400" />
                  Home
                </Link>
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <QuestionCircleOutlined className="mr-3 text-gray-400" />
                  Help
                </a>
                
                <div className="border-t border-gray-200 my-2"></div>
                <button 
                  onClick={handleAuthAction}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>


    </>
  );
}