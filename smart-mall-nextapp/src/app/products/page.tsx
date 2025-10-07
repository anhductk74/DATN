"use client";
export const dynamic = "force-dynamic";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  HeartOutlined,
  StarFilled,
  ShoppingCartOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";

function ProductsContent() {
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("featured");
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';

  // Mock products data
  const products = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: `Amazing Product ${i + 1}`,
    brand: ["Apple", "Samsung", "Sony", "Nike", "Adidas"][i % 5],
    price: Math.floor(Math.random() * 1000) + 100,
    originalPrice: Math.floor(Math.random() * 1500) + 200,
    rating: 4.0 + Math.random(),
    reviewCount: Math.floor(Math.random() * 1000) + 10,
    image: `/api/placeholder/300/300`,
    isNew: Math.random() > 0.7,
    discount: Math.floor(Math.random() * 50) + 10
  }));

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      'flash-sale': 'Flash Sale Products',
      'phones': 'Mobile Phones',
      'laptops': 'Laptops & Computers',
      'fashion': 'Fashion & Style',
      'home': 'Home & Living',
      'hot-deals': 'Hot Deals',
      'all': 'All Products'
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
            <p className="text-gray-600">{products.length} products found</p>
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
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
            : "space-y-4"
        }>
          {products.map((product) => (
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
                <span className="text-gray-400 text-sm">Product {product.id}</span>
                
                {product.isNew && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    NEW
                  </div>
                )}
                
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}%
                </div>

                <button 
                  className={`absolute bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 ${
                    viewMode === "list" ? "w-6 h-6 bottom-2 right-2" : "w-8 h-8 bottom-3 right-3"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to wishlist logic
                  }}
                >
                  <HeartOutlined className="text-gray-400 hover:text-red-500 text-sm" />
                </button>
              </div>

              <div className={viewMode === "list" ? "flex-1" : ""}>
                <h3 className={`font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors ${
                  viewMode === "list" ? "text-lg" : "text-sm"
                }`}>
                  {product.name}
                </h3>
                
                <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
                
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarFilled key={star} className="w-3 h-3 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                </div>

                <div className={`flex items-center space-x-2 mb-3 ${viewMode === "list" ? "text-xl" : ""}`}>
                  <span className="text-red-500 font-bold">${product.price}</span>
                  <span className="text-gray-500 line-through text-sm">${product.originalPrice}</span>
                </div>

                <button 
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                    viewMode === "list" 
                      ? "px-6 py-2" 
                      : "w-full py-2 text-sm"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart logic
                  }}
                >
                  <ShoppingCartOutlined className="mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            Load More Products
          </button>
        </div>
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