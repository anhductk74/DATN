"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useAuth } from "@/contexts/AuthContext";
import productService, { Product } from "@/services/ProductService";
import { App } from "antd";
import { getCloudinaryUrl } from "@/config/config";
import {
  MobileOutlined,
  LaptopOutlined,
  SkinOutlined,
  HomeOutlined,
  TrophyOutlined,
  StarFilled,
  ThunderboltOutlined,
} from "@ant-design/icons";

export default function Home() {
  const router = useRouter();
  const { status } = useAuth();
  const { message } = App.useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 45 });

  useAutoLogout({
    timeout: 30 * 60 * 1000,
    onLogout: () => router.push("/login"),
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const all = await productService.getAllProducts();
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        setFlashSaleProducts(shuffled.slice(0, 6));
        setProducts(shuffled.slice(6, 18));
      } catch {
        message.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 30, seconds: 45 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ================= BANNER ================= */}
      <section
        className="relative h-[560px] flex items-center overflow-hidden"
        style={{
          backgroundImage: "url('/banner-tech.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/75 to-transparent" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-white space-y-6">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                🚀 TECHNOLOGY STORE
              </span>

              <h1 className="text-6xl font-extrabold leading-tight drop-shadow-lg">
                Discover Modern
                <br />
                <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                  Technology
                </span>
              </h1>

              <p className="text-blue-50 text-lg max-w-lg leading-relaxed">
                Explore premium laptops, smartphones, and smart devices with minimalist
                design, reliable performance, and exceptional value.
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => router.push("/products")}
                  className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg
                             hover:bg-blue-50 hover:scale-105 hover:shadow-2xl transition-all transform"
                >
                  Shop Now →
                </button>
                <button
                  className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold
                             hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="hidden lg:block">
              <div className="bg-white/15 border border-white/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl hover:scale-105 transition-transform">
                <h3 className="text-white text-2xl font-bold mb-6">Why Choose Us?</h3>
                <div className="space-y-4 text-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-lg">100% Genuine Products</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-lg">Nationwide Warranty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-lg">Fast & Free Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK CATEGORY ================= */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Flash Sale", icon: ThunderboltOutlined, color: "from-red-500 to-orange-500", badge: "Hot" },
              { name: "Phones", icon: MobileOutlined, color: "from-blue-500 to-cyan-500" },
              { name: "Laptops", icon: LaptopOutlined, color: "from-purple-500 to-pink-500" },
              { name: "Fashion", icon: SkinOutlined, color: "from-pink-500 to-rose-500" },
              { name: "Home", icon: HomeOutlined, color: "from-green-500 to-emerald-500" },
              { name: "Voucher", icon: TrophyOutlined, color: "from-yellow-500 to-orange-500", badge: "New" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 text-center cursor-pointer
                             hover:border-blue-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                >
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {item.badge}
                    </span>
                  )}
                  <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center
                                   group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FLASH SALE ================= */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <ThunderboltOutlined className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Flash Sale Today</h2>
                <p className="text-gray-600">Deals ending soon!</p>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="hidden md:flex gap-2">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="bg-white border-2 border-red-500 rounded-xl px-4 py-3 min-w-[70px] shadow-lg">
                    <div className="text-2xl font-bold text-red-600">{String(item.value).padStart(2, '0')}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {flashSaleProducts.map((p) => {
              const v = p.variants?.[0];
              const soldPercent = Math.floor(Math.random() * 80) + 10;
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  className="group relative bg-white border-2 border-red-100 rounded-2xl p-4 cursor-pointer
                             hover:border-red-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Flash Sale Badge */}
                  <div className="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white 
                                  text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 animate-pulse">
                    -{Math.floor(Math.random() * 50) + 20}%
                  </div>

                  <div className="relative h-36 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl mb-3 overflow-hidden">
                    {p.images?.[0] && (
                      <Image
                        src={getCloudinaryUrl(p.images[0])}
                        alt={p.name}
                        width={140}
                        height={140}
                        className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>

                  <div className="text-sm font-medium line-clamp-2 mb-2 text-gray-700 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-red-600 font-bold text-lg">
                      ${v?.price?.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Sold</span>
                      <span className="text-red-600 font-semibold">{soldPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= RECOMMENDED ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Recommended For You
              </h2>
              <p className="text-gray-600">Handpicked products just for you</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/products')}
              aria-label="View all products"
              className="hidden md:inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all"
            >
              <span>View All</span>
              <span className="text-sm">→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {products.map((p) => {
              const v = p.variants?.[0];
              const rating = p.averageRating || 4.5;
              const reviews = p.reviewCount || 0;
              
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-4 cursor-pointer
                             hover:border-blue-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative h-44 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl mb-3 overflow-hidden">
                    {p.images?.[0] && (
                      <Image
                        src={getCloudinaryUrl(p.images[0])}
                        alt={p.name}
                        width={180}
                        height={180}
                        className="object-contain w-full h-full p-3 group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold line-clamp-2 mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <StarFilled key={i} style={{ color: i < Math.floor(rating) ? '#fadb14' : '#d9d9d9' }} />
                      ))}
                    </div>
                    {reviews > 0 && (
                      <span className="text-xs text-gray-500">({reviews})</span>
                    )}
                  </div>

                  <div className="font-bold text-blue-700 text-lg">
                    ${v?.price?.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
