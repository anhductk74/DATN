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
  LoadingOutlined,
  ProductOutlined,
  CameraOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { Drawer, List, Button, Divider, Badge, InputNumber } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItem } from "@/contexts/CartContext";
import { useAntdApp } from "@/hooks/useAntdApp";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { getCloudinaryUrl } from "@/config/config";
import Image from "next/image";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [cartHideTimeout, setCartHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const { count: wishlistCount } = useWishlist();
  
  // Debug wishlist count
  useEffect(() => {
    console.log('💖 Header - Wishlist count updated:', wishlistCount);
  }, [wishlistCount]);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
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
    
    // No avatar is a normal case - return undefined without logging
    return undefined;
  };
  
  // Cart popup hover handlers
  const handleCartMouseEnter = () => {
    if (cartHideTimeout) {
      clearTimeout(cartHideTimeout);
      setCartHideTimeout(null);
    }
    setShowCartPopup(true);
  };

  const handleCartMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowCartPopup(false);
    }, 300); // 300ms delay before hiding
    setCartHideTimeout(timeout);
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

  // Search handlers
  const handleTextSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning("Please enter search keywords");
      return;
    }

    console.log('🔍 Header - Text search initiated:', searchQuery);
    // Navigate to products page with search query and mode
    router.push(`/products?search=${encodeURIComponent(searchQuery)}&mode=text`);
    setShowSearchPopup(false);
    setIsSearching(false);
  };

  const handleImageSearch = async (file: File) => {
    setIsSearching(true);
    const formData = new FormData();
    formData.append('search_image', file);
    formData.append('max_results', '20');

    try {
      const apiUrl = 'http://localhost:5001';
      console.log('📸 Uploading image to:', `${apiUrl}/ai_search_by_image`);
      
      const response = await fetch(`${apiUrl}/ai_search_by_image`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('📥 Image search response status:', response.status);
      const data = await response.json();
      console.log('📦 Image search API response:', data);

      if (data.success) {
        const products = data.products || [];
        console.log('✅ Storing', products.length, 'products in sessionStorage');
        console.log('📄 Sample product:', products[0]);
        
        // Clear previous search results first
        sessionStorage.removeItem('imageSearchResults');
        
        // Store image search results in sessionStorage with timestamp
        const searchData = {
          products: products,
          timestamp: Date.now()
        };
        sessionStorage.setItem('imageSearchResults', JSON.stringify(searchData));
        
        // Set loading state before navigation
        sessionStorage.setItem('imageSearchLoading', 'true');
        
        // Navigate to products page with image search flag and unique timestamp
        const timestamp = Date.now();
        router.push(`/products?search=${timestamp}&mode=image`);
        setShowSearchPopup(false);
        message.success(`Found ${data.total_matches || products.length} similar products`);
      } else {
        console.error('❌ Image search failed:', data.error);
        message.error(data.error || "Image search failed");
      }
    } catch (error) {
      console.error("❌ Image search error:", error);
      message.error("Unable to search by image. Please try again.");
    } finally {
      setIsSearching(false);
    }
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
        // Clear cart timeout if clicking outside
        if (cartHideTimeout) {
          clearTimeout(cartHideTimeout);
          setCartHideTimeout(null);
        }
      }
      if (!target.closest('.notification-popup-container')) {
        setShowNotificationPopup(false);
      }
      if (!target.closest('.relative.w-full')) {
        setShowSearchPopup(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      // Cleanup timeout on unmount
      if (cartHideTimeout) {
        clearTimeout(cartHideTimeout);
      }
    };
  }, [cartHideTimeout]);

  

  return (
    <>
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" role="button" tabIndex={0} onClick={() => handleNavigate('/home', false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate('/home', false); }}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-blue-700">
              SmartMall
            </span>
          </div>

          {/* Search Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                  onFocus={() => setShowSearchPopup(true)}
                  placeholder="Search products, brands, and more..."
                  className="w-full px-6 py-3 pl-12 pr-12 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={isSearching}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <SearchOutlined className="text-blue-600 text-lg" />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <CloseCircleOutlined />
                  </button>
                )}
              </div>
              
              <label className={`px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center transition-all ${
                isSearching 
                  ? 'cursor-not-allowed opacity-70' 
                  : 'cursor-pointer hover:from-purple-700 hover:to-pink-700'
              }`}>
                {isSearching ? (
                  <LoadingOutlined className="text-xl animate-spin" />
                ) : (
                  <CameraOutlined className="text-xl" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isSearching}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSearch(file);
                  }}
                />
              </label>

              {/* Search Suggestions Popup */}
              {showSearchPopup && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-[100]">
                  <div className="text-sm text-gray-500 mb-2">Quick suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {['Samsung phone', 'gaming laptop', 'wireless headphones', 'smartwatch'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setTimeout(() => handleTextSearch(), 100);
                        }}
                        className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                  >
                    <BellOutlined className="text-xl transition-transform group-hover:scale-110" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold transition-transform group-hover:scale-105">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Popup */}
                  {showNotificationPopup && (
                    <div 
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[100]"
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
                                ? 'bg-blue-50 border-l-4 border-blue-500' 
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
                          className="bg-blue-600 hover:bg-blue-700 border-none"
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
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                >
                  <HeartOutlined className="text-xl transition-transform group-hover:scale-110" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold transition-transform group-hover:scale-105">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </button>
                
                {/* Cart (hover to preview, click to open /cart) */}
                <div 
                  className="relative cart-popup-container"
                  onMouseEnter={handleCartMouseEnter}
                  onMouseLeave={handleCartMouseLeave}
                >
                  <button
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNavigate('/cart')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate('/cart'); }}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                  >
                    <ShoppingCartOutlined className="text-xl transition-transform group-hover:scale-110" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-semibold transition-transform group-hover:scale-105">
                      {cart.totalCount > 99 ? '99+' : cart.totalCount}
                    </span>
                  </button>

                  {showCartPopup && (
                    <div 
                      className="absolute right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[100]"
                      style={{ marginTop: '8px' }}
                    >
                      {/* Header */}
                      <div className="bg-blue-600 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ShoppingCartOutlined className="text-white text-lg" />
                            <span className="text-white font-semibold">Shopping Cart</span>
                          </div>
                          <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            {cart.totalCount}
                          </div>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="max-h-96 overflow-y-auto">
                        {cart.items.length === 0 ? (
                          <div className="py-10 text-center px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <ShoppingCartOutlined className="text-3xl text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Cart is empty</p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-2">
                            {cart.items.map((item: CartItem, index: number) => (
                              <div 
                                key={item.cartItemId || index} 
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                onClick={() => handleNavigate('/cart')}
                              >
                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                  {item.image ? (
                                    <Image 
                                      src={getCloudinaryUrl(item.image)} 
                                      alt={item.title} 
                                      width={56} 
                                      height={56} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ProductOutlined className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1" title={item.title}>
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">×{item.quantity}</span>
                                    <span className="font-bold text-blue-600">${item.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {cart.items.length > 0 && (
                        <>
                          <div className="border-t border-gray-200"></div>
                          <div className="px-3 py-3">
                            <button
                              onClick={() => handleNavigate('/cart')}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                            >
                              View Cart
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User Menu or Login Button */}
            {mergedUser ? (
              <div className="relative user-menu-container">
                <button 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
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
                  <div className="flex flex-col items-start ">
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
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-blue-100 py-2 z-[9999]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-blue-100 bg-blue-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
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
                        className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition"
                      >
                        <UserOutlined className="text-blue-600 mr-3" />
                        <span className="font-medium">My Profile</span>
                      </button>
                      <button onClick={() => handleNavigate('/my-orders')} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition">
                        <TagOutlined className="text-blue-600 mr-3" />
                        <span className="font-medium">My Orders</span>
                      </button>
                      <a 
                        href="/shop-management/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition"
                      >
                        <HeartOutlined className="text-blue-600 mr-3" />
                        <span className="font-medium">My Shop</span>
                      </a>
                      <button onClick={() => handleNavigate('/support', false)} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition">
                        <CustomerServiceOutlined className="text-blue-600 mr-3" />
                        <span className="font-medium">Support</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 my-2 mx-4"></div>
                    <div className="px-2 pb-2">
                      <button 
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className={`flex items-center w-full text-left px-3 py-2 text-sm transition rounded-lg ${
                          isLoggingOut 
                            ? "bg-gray-100 cursor-not-allowed opacity-70" 
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <div className="mr-3">
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isSearching}
              />
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <CloseCircleOutlined />
                </button>
              )}
            </div>
            
            <label className={`px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center transition-all ${
              isSearching 
                ? 'cursor-not-allowed opacity-70' 
                : 'cursor-pointer hover:from-purple-700 hover:to-pink-700'
            }`}>
              {isSearching ? (
                <LoadingOutlined className="animate-spin" />
              ) : (
                <CameraOutlined />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isSearching}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSearch(file);
                }}
              />
            </label>
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
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
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
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </button>
                <button onClick={() => handleNavigate('/cart')} className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <ShoppingCartOutlined className="mr-3 text-gray-400" />
                  Cart
                  {cart.totalCount > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-semibold">
                      {cart.totalCount > 99 ? '99+' : cart.totalCount}
                    </span>
                  )}
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
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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