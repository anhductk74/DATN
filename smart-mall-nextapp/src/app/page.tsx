"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistButton from "@/components/WishlistButton";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useAuth } from "@/contexts/AuthContext";
import productService, { Product } from "@/services/ProductService";
import categoryService, { Category } from "@/services/CategoryService";
import { App } from "antd";
import { getCloudinaryUrl, DEFAULT_PRODUCT_IMAGE } from "@/config/config";
import {
  ThunderboltOutlined,
  StarFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

export default function Home() {
  const router = useRouter();
  const { status } = useAuth();
  const { message } = App.useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 45 });
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const animationRef = useRef<number>();

  useAutoLogout({
    timeout: 30 * 60 * 1000,
    onLogout: () => router.push("/login"),
  });

  const checkScrollButtons = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 400;
      const newPosition = direction === 'left' 
        ? categoryScrollRef.current.scrollLeft - scrollAmount
        : categoryScrollRef.current.scrollLeft + scrollAmount;
      
      categoryScrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      
      setTimeout(() => checkScrollButtons(), 300);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (categoryScrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - categoryScrollRef.current.offsetLeft);
      setScrollLeft(categoryScrollRef.current.scrollLeft);
      setLastX(e.pageX);
      setLastTime(Date.now());
      setVelocity(0);
      categoryScrollRef.current.style.scrollBehavior = 'auto';
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoryScrollRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    categoryScrollRef.current.scrollLeft = scrollLeft - walk;
    
    // Calculate velocity cho momentum scrolling
    const now = Date.now();
    const timeDelta = now - lastTime;
    if (timeDelta > 0) {
      const newVelocity = (e.pageX - lastX) / timeDelta;
      setVelocity(newVelocity);
    }
    setLastX(e.pageX);
    setLastTime(now);
  };

  const applyMomentum = () => {
    if (!categoryScrollRef.current || Math.abs(velocity) < 0.1) return;
    
    categoryScrollRef.current.scrollLeft -= velocity * 10;
    setVelocity(velocity * 0.95); // Friction
    
    animationRef.current = requestAnimationFrame(applyMomentum);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (categoryScrollRef.current) {
      categoryScrollRef.current.style.scrollBehavior = 'smooth';
    }
    // Apply momentum scrolling
    if (Math.abs(velocity) > 0.5) {
      applyMomentum();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (categoryScrollRef.current) {
        categoryScrollRef.current.style.scrollBehavior = 'smooth';
      }
      if (Math.abs(velocity) > 0.5) {
        applyMomentum();
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allProducts, allCategories] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories()
        ]);
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        setProducts(shuffled.slice(0, 12));
        
        // Flatten categories để hiển thị tất cả (bao gồm subcategories)
        const flattenCategories = (cats: Category[]): Category[] => {
          const result: Category[] = [];
          cats.forEach(cat => {
            result.push(cat);
            if (cat.subCategories && cat.subCategories.length > 0) {
              result.push(...flattenCategories(cat.subCategories));
            }
          });
          return result;
        };
        
        const flattened = flattenCategories(allCategories);
        setCategories(flattened);
        console.log('📦 Total categories loaded:', flattened.length);
        console.log('📦 Categories:', flattened);
        
        // Check if scroll arrows needed
        setTimeout(() => checkScrollButtons(), 100);
      } catch (error) {
        console.error('❌ Error loading data:', error);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Fetch flash sale products
  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        setFlashSaleLoading(true);
        const response = await productService.getActiveFlashSaleProducts(0, 6);
        console.log('⚡ Flash Sale API Response:', response);
        console.log('⚡ Flash Sale Products:', response.content);
        if (response.content && response.content.length > 0) {
          console.log('⚡ Sample Flash Sale Product:', response.content[0]);
          console.log('⚡ Product Image:', response.content[0].productImage);
        }
        setFlashSaleProducts(response.content || []);
      } catch (error) {
        console.error('❌ Error loading flash sale products:', error);
        // Silently fail, flash sale section will just be empty
      } finally {
        setFlashSaleLoading(false);
      }
    };
    fetchFlashSaleProducts();
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
              <p className="text-sm text-gray-500 mt-1">{categories.length} categories available</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCategories('left')}
                disabled={!showLeftArrow}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${showLeftArrow 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <LeftOutlined />
              </button>
              <button
                onClick={() => scrollCategories('right')}
                disabled={!showRightArrow}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${showRightArrow 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <RightOutlined />
              </button>
            </div>
          </div>
          
          <div 
            ref={categoryScrollRef}
            onScroll={checkScrollButtons}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pt-2 cursor-grab active:cursor-grabbing select-none"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: isDragging ? 'none' : 'x proximity',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categories.map((category) => {
              return (
                <div
                  key={category.id}
                  onClick={() => router.push(`/products?category=${category.id}`)}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 text-center cursor-pointer
                             hover:border-blue-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300
                             flex-shrink-0 w-40"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center overflow-hidden
                                  bg-white border-2 border-gray-200 group-hover:scale-110 group-hover:rotate-3 
                                  transition-transform duration-300 shadow-lg">
                    {category.image ? (
                      <Image
                        src={getCloudinaryUrl(category.image)}
                        alt={category.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-xl">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {category.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FLASH SALE ================= */}
      {flashSaleProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ThunderboltOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Flash Sale Today</h2>
                  <p className="text-gray-600">Limited time offers!</p>
                </div>
              </div>
              
              {/* Countdown Timer */}
              <div className="hidden md:flex gap-2">
                {[
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-white border-2 border-red-500 rounded-xl px-4 py-3 min-w-[70px] shadow-lg">
                      <div className="text-2xl font-bold text-red-600">{String(item.value).padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {flashSaleLoading ? (
              <div className="text-center py-12">
                <span className="text-gray-600">Loading flash sale products...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {flashSaleProducts.map((item) => {
                  // Use timeRemaining from API response (in seconds)
                  const timeRemaining = item.timeRemaining || 0;
                  const hours = Math.floor(timeRemaining / 3600);
                  const minutes = Math.floor((timeRemaining % 3600) / 60);
                  
                  // Use flashSaleQuantity if available, otherwise fall back to stock
                  const availableQty = item.flashSaleQuantity || item.stock || 0;
                  const soldPercentage = item.flashSaleQuantity 
                    ? Math.max(0, Math.min(100, ((item.flashSaleQuantity - availableQty) / item.flashSaleQuantity) * 100))
                    : 50; // Default visual percentage if no quantity info
                  
                  return (
                    <div
                      key={item.variantId}
                      onClick={() => router.push(`/product/${item.productId}`)}
                      className="group relative bg-white border-2 border-red-100 rounded-2xl p-4 cursor-pointer
                                 hover:border-red-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* Flash Sale Badge */}
                      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white 
                                      text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 animate-pulse">
                        -{item.discountPercent || 0}%
                      </div>

                      {/* Wishlist Button */}
                      <div className="absolute top-2 right-2 z-10">
                        <WishlistButton productId={item.productId} size="small" />
                      </div>

                      <div className="relative h-36 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl mb-3 overflow-hidden">
                        <Image
                          src={item.productImage ? getCloudinaryUrl(item.productImage) : DEFAULT_PRODUCT_IMAGE}
                          alt={item.productName}
                          width={140}
                          height={140}
                          className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform duration-500"
                          unoptimized={!item.productImage}
                          onError={(e) => {
                            console.error('❌ Image load error for:', item.productName, item.productImage);
                            e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                          }}
                        />
                      </div>

                      <div className="text-sm font-medium line-clamp-2 mb-3 text-gray-700 group-hover:text-blue-600 transition-colors">
                        {item.productName}
                      </div>

                      {/* Price Section */}
                      <div className="mb-3">
                        <div className="flex flex-col gap-0.5 mb-1">
                          <div className="text-gray-400 line-through text-xs">
                            ${item.price?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-red-600 font-bold text-xl">
                            ${item.flashSalePrice?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                            Flash Price
                          </span>
                          {item.price && item.flashSalePrice && (
                            <span className="text-gray-500">
                              Save ${(item.price - item.flashSalePrice).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar - Flash Sale Quantity */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Available</span>
                          <span className="text-red-600 font-semibold">{availableQty} left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max(10, 100 - soldPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

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
                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2 z-10">
                    <WishlistButton productId={p.id} size="small" />
                  </div>

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
                        <StarFilled key={`star-${p.id}-${i}`} style={{ color: i < Math.floor(rating) ? '#fadb14' : '#d9d9d9' }} />
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
