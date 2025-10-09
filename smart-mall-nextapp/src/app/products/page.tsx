"use client";
export const dynamic = "force-dynamic";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import productService, { Product } from "@/services/productService";
import categoryService from "@/services/categoryService";
import { message } from "antd";
import { CLOUDINARY_API_URL } from "@/config/config";
import { 
  HeartOutlined,
  StarFilled,
  ShoppingCartOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LoadingOutlined
} from "@ant-design/icons";

function ProductsContent() {
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("featured");
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const { addItem } = useCart();

  // Fetch categories
  const {
    data: categories = [],
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch products using TanStack Query
  const {
    data: products = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['products', category, sortBy],
    queryFn: async () => {
      const allProducts = await productService.getAllProducts();
      
      // Filter by category if not 'all'
      let filteredProducts = allProducts;
      if (category !== 'all') {
        // Filter products by categoryId
        const selectedCategory = categories.find(cat => 
          cat.name.toLowerCase().replace(/\s+/g, '-') === category ||
          cat.id === category
        );
        
        if (selectedCategory) {
          filteredProducts = allProducts.filter(product => 
            product.categoryId === selectedCategory.id
          );
        }
      }
      
      // Sort products based on sortBy
      const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0);
          case 'price-high':
            return (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0);
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'rating':
          case 'featured':
          default:
            return 0; // Keep original order for now
        }
      });
      
      return sortedProducts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0]; // Use first variant
      addItem({
        id: product.id || Math.random().toString(),
        title: product.name,
        price: variant.price,
        image: product.images?.[0],
        shopName: `Shop ${product.shopId}`,
        variant: variant.sku,
        quantity: 1
      });
      message.success("Đã thêm vào giỏ hàng!");
    } else {
      message.error("Sản phẩm không có phiên bản để bán");
    }
  };

  const getCategoryTitle = (category: string) => {
    if (category === 'all') return 'All Products';
    
    // Try to find the category in real data first
    const foundCategory = categories.find(cat => 
      cat.name.toLowerCase().replace(/\s+/g, '-') === category ||
      cat.id === category
    );
    
    if (foundCategory) {
      return foundCategory.name;
    }
    
    // Fallback to static titles for special categories
    const titles: { [key: string]: string } = {
      'flash-sale': 'Flash Sale Products',
      'phones': 'Mobile Phones',
      'laptops': 'Laptops & Computers',
      'fashion': 'Fashion & Style',
      'home': 'Home & Living',
      'hot-deals': 'Hot Deals',
    };
    return titles[category] || 'Products';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => router.push("/home")} className="hover:text-blue-600 transition-colors">
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{getCategoryTitle(category)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{getCategoryTitle(category)}</h1>
            <p className="text-gray-600">
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingOutlined className="mr-2" />
                  Loading products...
                </span>
              ) : isError ? (
                <span className="text-red-500">Error loading products</span>
              ) : (
                `${products.length} products found`
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600"
                }`}
              >
                <AppstoreOutlined />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600"
                }`}
              >
                <UnorderedListOutlined />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Filter Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors">
              <FilterOutlined />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          // Loading skeleton
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }>
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white rounded-3xl p-4 shadow-sm animate-pulse border border-gray-100">
                <div className="w-full h-40 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          // Error state
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😵</div>
            <div className="text-gray-400 text-xl mb-2">Không thể tải sản phẩm</div>
            <div className="text-gray-500 text-sm mb-6">Vui lòng thử lại sau</div>
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              onClick={() => refetch()}
            >
              Thử lại
            </button>
          </div>
        ) : products.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <div className="text-gray-400 text-xl mb-2">Không có sản phẩm</div>
            <div className="text-gray-500 text-sm mb-6">Chưa có sản phẩm nào trong danh mục này</div>
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              onClick={() => router.push('/home')}
            >
              Quay về trang chủ
            </button>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }>
            {products.map((product: Product) => {
              const variant = product.variants?.[0];
              const price = variant?.price || 0;
              const originalPrice = Math.round(price * 1.3); // Mock original price
              
              return (
              <div
                key={product.id}
                className={`group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 cursor-pointer ${
                  viewMode === "list" ? "flex items-center p-4 space-x-6" : "p-4"
                }`}
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden ${
                  viewMode === "list" ? "w-24 h-24 flex-shrink-0" : "w-full h-40 mb-4"
                }`}>
                  {product.images?.[0] ? (
                    <Image 
                      src={`${CLOUDINARY_API_URL}${product.images[0]}`} 
                      alt={product.name}
                      fill
                      className="object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">
                      {product.name}
                    </span>
                  )}
                  
                  {product.status === 'ACTIVE' && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{Math.floor(((originalPrice - price) / originalPrice) * 100)}%
                  </div>

                  <button 
                    className={`absolute bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 ${
                      viewMode === "list" ? "w-6 h-6 bottom-2 right-2" : "w-8 h-8 bottom-3 right-3"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      message.info("Wishlist feature coming soon!");
                    }}
                  >
                    <HeartOutlined className="text-gray-400 hover:text-red-500 text-sm" />
                  </button>
                </div>

                <div className={viewMode === "list" ? "flex-1" : ""}>
                  <h3 className={`font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2 ${
                    viewMode === "list" ? "text-lg" : "text-sm"
                  }`}>
                    {product.name}
                  </h3>
                  
                  <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarFilled key={star} className="w-3 h-3 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500">(4.8)</span>
                  </div>

                  <div className={`flex items-center space-x-2 mb-3 ${viewMode === "list" ? "text-xl" : ""}`}>
                    <span className="text-red-500 font-bold">${price.toLocaleString()}</span>
                    <span className="text-gray-500 line-through text-sm">${originalPrice.toLocaleString()}</span>
                  </div>

                  <button 
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                      viewMode === "list" 
                        ? "px-6 py-2" 
                        : "w-full py-2 text-sm"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingCartOutlined className="text-sm" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Load More / Refresh Button */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="text-center mt-12">
            <button 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => refetch()}
            >
              Refresh Products
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}