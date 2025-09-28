"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserProfile from "@/components/UserProfile";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  HeartOutlined, 
  MobileOutlined,
  LaptopOutlined,
  SkinOutlined,
  HomeOutlined,
  TrophyOutlined,
  StarFilled,
  FireOutlined,
  GiftOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";

export default function Home() {
  const router = useRouter();
  const { session, status } = useAuth();

  // Auto logout after 30 minutes of inactivity
  useAutoLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onLogout: () => {
      router.push("/login");
    }
  });

  useEffect(() => {
    if (status === "loading") return; // Wait for auth state to load
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Modern Hero Banner */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg animate-pulse">
                  <StarFilled className="mr-2" />
                  NEW ARRIVAL
                </div>
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-medium border border-white/30">
                  🔥 Limited Stock
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-black leading-none tracking-tight">
                  Latest
                  <br />
                  <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Collection
                  </span>
                  <br />
                  <span className="text-4xl lg:text-5xl font-normal">2025</span>
                </h1>
                <p className="text-2xl lg:text-3xl font-light text-blue-100/90">
                  Discover Tomorrow&apos;s Tech Today ✨
                </p>
              </div>
              
              <p className="text-lg text-blue-100/80 leading-relaxed max-w-lg">
                Experience the future with our cutting-edge products featuring AI integration, 
                sustainable materials, and innovative designs that redefine modern living.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-center justify-center">
                    <StarFilled className="mr-2 text-emerald-500 group-hover:animate-spin" />
                    <span>Explore New</span>
                    <div className="ml-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  </div>
                </button>
                <button className="group bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 border border-white/20 hover:border-white/40">
                  <FireOutlined className="mr-2 group-hover:animate-bounce" />
                  Pre-Order Now
                  <span className="ml-2 bg-emerald-500 text-xs px-2 py-1 rounded-full">NEW</span>
                </button>
              </div>
            </div>
            
            {/* Right Content - Product Highlights */}
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <StarFilled className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-sm text-blue-100">New Products</div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <MobileOutlined className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">AI</div>
                <div className="text-sm text-blue-100">Smart Tech</div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <LaptopOutlined className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">5G</div>
                <div className="text-sm text-blue-100">Ready Devices</div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-6 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <TrophyOutlined className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">Eco</div>
                <div className="text-sm text-blue-100">Friendly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <p className="text-xl text-gray-600">Everything you need in one place</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Flash Sale", icon: ThunderboltOutlined, color: "from-red-500 to-pink-500", bgColor: "bg-red-50", textColor: "text-red-600", route: "/products?category=flash-sale" },
              { name: "Vouchers", icon: GiftOutlined, color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50", textColor: "text-purple-600", route: "/vouchers" },
              { name: "Free Shipping", icon: TrophyOutlined, color: "from-green-500 to-emerald-500", bgColor: "bg-green-50", textColor: "text-green-600", route: "/products?filter=free-shipping" },
              { name: "Hot Deal", icon: FireOutlined, color: "from-orange-500 to-red-500", bgColor: "bg-orange-50", textColor: "text-orange-600", route: "/products?category=hot-deals" },
              { name: "Phones", icon: MobileOutlined, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50", textColor: "text-blue-600", route: "/products?category=phones" },
              { name: "Laptops", icon: LaptopOutlined, color: "from-gray-500 to-slate-500", bgColor: "bg-gray-50", textColor: "text-gray-600", route: "/products?category=laptops" },
              { name: "Fashion", icon: SkinOutlined, color: "from-pink-500 to-rose-500", bgColor: "bg-pink-50", textColor: "text-pink-600", route: "/products?category=fashion" },
              { name: "Home & Living", icon: HomeOutlined, color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-50", textColor: "text-amber-600", route: "/products?category=home" },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={index} 
                  className="group cursor-pointer"
                  onClick={() => router.push(item.route)}
                >
                  <div className={`${item.bgColor} rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-gray-100 hover:border-gray-200`}>
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform`}>
                      <IconComponent className="text-white text-xl" />
                    </div>
                    <div className={`text-sm font-semibold ${item.textColor}`}>{item.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-16 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                <ThunderboltOutlined className="text-white text-4xl animate-pulse" />
                <h2 className="text-4xl font-bold text-white">Flash Sale</h2>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-4 text-white">
                <span className="text-lg">Ends in:</span>
                <div className="flex space-x-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/30">
                    <div className="text-2xl font-bold">02</div>
                    <div className="text-xs">Hours</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/30">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-xs">Minutes</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/30">
                    <div className="text-2xl font-bold">30</div>
                    <div className="text-xs">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30">
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div 
                key={item} 
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => router.push(`/product/${item}`)}
              >
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-medium">Flash Product {item}</span>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-500 mb-1">$299</div>
                  <div className="text-sm text-gray-500 line-through mb-3">$599</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <div className="text-xs text-gray-600">Sold 75</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Recommended for You</h2>
            <p className="text-xl text-gray-600">Handpicked just for you based on your preferences</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
              <div key={item} className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                <div 
                  className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/product/${item + 10}`)} // Offset để tránh trùng với flash sale
                >
                  <span className="text-gray-400 text-sm">Product {item}</span>
                  <button 
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation when clicking heart
                      // Add to wishlist logic here
                    }}
                  >
                    <HeartOutlined className="text-gray-400 hover:text-red-500 text-sm" />
                  </button>
                </div>
                <h3 
                  className="font-semibold text-gray-900 mb-2 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => router.push(`/product/${item + 10}`)}
                >
                  High Quality Product {item}
                </h3>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarFilled key={star} className="w-3 h-3 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500">(4.8)</span>
                </div>
                <div className="text-red-500 font-bold text-lg mb-3">
                  ${(item * 150 + 100)}
                </div>
                <button 
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when clicking add to cart
                    // Add to cart logic here
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Profile Section for Testing */}
      {session && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <UserProfile />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
