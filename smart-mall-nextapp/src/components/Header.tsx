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
import { useAuth } from "@/contexts/AuthContext";
import { useAntdApp } from "@/hooks/useAntdApp";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { session, status, signOut, user } = useAuth();
  const { message } = useAntdApp();

  // Use auth state from NextAuth session only
  const currentUser = user;

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
    if (currentUser) {
      router.push("/home");
    } else {
      router.push("/login");
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
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/home")}>
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
            {currentUser && (
              <>
                {/* Notifications */}
                <button className="relative p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md group">
                  <BellOutlined className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg animate-pulse">2</span>
                </button>

                {/* Wishlist */}
                <button className="relative p-3 text-gray-600 hover:text-pink-600 transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 hover:shadow-md group">
                  <HeartOutlined className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">3</span>
                </button>
                
                {/* Cart */}
                <button className="relative p-3 text-gray-600 hover:text-green-600 transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:shadow-md group">
                  <ShoppingCartOutlined className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">5</span>
                </button>
              </>
            )}

            {/* User Menu or Login Button */}
            {currentUser ? (
              <div className="relative user-menu-container">
                <button 
                  className="flex items-center space-x-3 px-3 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <UserOutlined className="text-white text-lg" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                      {currentUser.name || currentUser.email?.split('@')[0]}
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
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <UserOutlined className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{currentUser.name || currentUser.email?.split('@')[0]}</p>
                          <p className="text-sm text-gray-600 truncate">{currentUser.email}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <UserOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-blue-700">My Profile</span>
                      </a>
                      <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-2xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <TagOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-green-700">My Orders</span>
                      </a>
                      <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 rounded-2xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <HeartOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-pink-700">Wishlist</span>
                      </a>
                      <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 rounded-2xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <CustomerServiceOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-medium group-hover:text-purple-700">Support</span>
                      </a>
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
                onClick={handleAuthAction}
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
            {currentUser ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <UserOutlined className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentUser.name || currentUser.email?.split('@')[0]}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <HomeOutlined className="mr-3 text-gray-400" />
                  Home
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <UserOutlined className="mr-3 text-gray-400" />
                  Account
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <TagOutlined className="mr-3 text-gray-400" />
                  Orders
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <HeartOutlined className="mr-3 text-gray-400" />
                  Wishlist
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <ShoppingCartOutlined className="mr-3 text-gray-400" />
                  Cart
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <CustomerServiceOutlined className="mr-3 text-gray-400" />
                  Support
                </a>
                
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