"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistButton from "@/components/WishlistButton";
import { useCart } from "@/contexts/CartContext";
import productService, { Product, ProductVariant } from "@/services/ProductService";
import categoryService from "@/services/CategoryService";
import { App } from "antd";
import { getCloudinaryUrl } from "@/config/config";
import { 
  HeartOutlined,
  StarFilled,
  ShoppingCartOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LoadingOutlined,
  SearchOutlined
} from "@ant-design/icons";

// API Response interfaces
interface ApiCategory {
  id: string;
  name: string;
  status: string;
}

interface ApiShop {
  id: string;
  name: string;
  viewCount: number;
}

interface ApiProduct {
  id: string;
  name: string;
  brand: string;
  category: ApiCategory;
  shop: ApiShop;
  minPrice: number;
  maxPrice: number;
  images: string[];
  description: string;
  status: string;
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
}

function ProductsContent() {
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("featured");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const hasShownMessageRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search');
  const searchMode = searchParams.get('mode');
  const { message } = App.useApp();

  // Reset message flag when search query changes
  useEffect(() => {
    hasShownMessageRef.current = false;
  }, [searchQuery]);

  // Fetch categories
  const {
    data: categories = [],
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle AI search when search query is present
  useEffect(() => {
    const fetchSearchResults = async () => {
      console.log('🔄 useEffect triggered:', { searchQuery, searchMode });
      
      if (searchQuery && searchMode === 'text') {
        console.log('🔍 Starting text search:', { searchQuery, searchMode });
        setIsSearching(true);
        try {
          // Use environment variable for API URL
          const apiUrl = process.env.NEXT_PUBLIC_URL_PYTHON || 'http://localhost:5001';
          const fullUrl = `${apiUrl}/ai_smart_search?query=${encodeURIComponent(searchQuery)}`;
          console.log('🌐 API URL:', apiUrl);
          console.log('📡 Calling API with URL:', fullUrl);
          
          const response = await fetch(fullUrl);
          console.log('📥 Response status:', response.status);
          
          const data = await response.json();
          console.log('📦 Search API Response:', data);

          if (data.success) {
            const apiProducts = data.data.products || [];
            console.log('✅ API returned products:', apiProducts.length, 'products');
            console.log('📄 First product sample:', apiProducts[0]);
            
            // Map API response to Product interface
            const mappedProducts = apiProducts.map((p: ApiProduct) => ({
              ...p,
              categoryId: p.category?.id || '',
              shopId: p.shop?.id || '',
              // Ensure variants array exists, create minimal variant if missing
              variants: p.variants || [{
                id: `${p.id}-default`,
                sku: `SKU-${p.id}`,
                price: p.minPrice || p.maxPrice || 0,
                stock: 100,
                attributes: []
              }]
            }));
            
            console.log('✅ Mapped products:', mappedProducts.length, 'products');
            console.log('📄 First mapped product:', mappedProducts[0]);
            setSearchResults(mappedProducts);
            console.log('✅ Search results state updated');
            message.success(`Found ${data.data.totalItems || 0} products`);
          } else {
            message.error(data.message || "Search failed");
            setSearchResults([]);
          }
        } catch (error) {
          console.error("❌ Search error:", error);
          console.error("Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          message.error("Unable to search. Please try again.");
          setSearchResults([]);
        } finally {
          console.log('🏁 Search completed, isSearching set to false');
          setIsSearching(false);
        }
      } else if (searchQuery && searchMode === 'image') {
        console.log('🖼️ Image search mode detected');
        setIsSearching(true); // Start loading
        
        // Always load from sessionStorage for image search
        console.log('📦 Loading image results from sessionStorage...');
        const storedResults = sessionStorage.getItem('imageSearchResults');
        if (storedResults) {
          try {
            const storedData = JSON.parse(storedResults);
            // Handle both old format (array) and new format (object with timestamp)
            const imageResults = Array.isArray(storedData) ? storedData : storedData.products;
            
            console.log('✅ Raw image results from storage:', imageResults);
            console.log('✅ Number of image results:', imageResults.length);
            
            if (imageResults.length > 0) {
              console.log('📄 Sample raw product:', imageResults[0]);
              
              // Map image search results to Product interface
              const mappedResults = imageResults.map((p: any) => {
                console.log('🔄 Mapping image product:', {
                  id: p.id,
                  name: p.name,
                  brand: p.brand,
                  category: p.category,
                  shopName: p.shopName,
                  image: p.image,
                  minPrice: p.minPrice
                });
                
                const mapped: Product = {
                  id: p.id || '',
                  name: p.name || 'Unnamed Product',
                  description: p.description || '',
                  brand: p.brand || '',
                  images: p.image ? [p.image] : (p.images || []),
                  status: 'ACTIVE' as const,
                  categoryId: '',
                  shopId: '',
                  variants: [{
                    id: p.id + '-default',
                    sku: 'SKU-' + p.id,
                    price: p.minPrice || p.maxPrice || 0,
                    stock: 100,
                    attributes: []
                  }],
                  category: {
                    id: '',
                    name: p.category || 'Uncategorized',
                    description: ''
                  },
                  shop: {
                    id: '',
                    name: p.shopName || 'Unknown Shop',
                    description: '',
                    numberPhone: ''
                  },
                  averageRating: p.rating || 0,
                  reviewCount: p.reviewCount || 0
                };
                
                console.log('✅ Mapped product:', mapped);
                return mapped;
              });
              
                console.log('✅ Total mapped products:', mappedResults.length);
              console.log('📄 First fully mapped product:', mappedResults[0]);
              
              // Set state BEFORE removing from storage
              setSearchResults(mappedResults);
              
              // Check if this is a new search (loading flag exists) and message hasn't been shown
              const shouldShowMessage = sessionStorage.getItem('imageSearchLoading') === 'true' && !hasShownMessageRef.current;
              
              // Remove loading flag
              sessionStorage.removeItem('imageSearchLoading');
              
              // Wait a bit then remove from storage
              setTimeout(() => {
                sessionStorage.removeItem('imageSearchResults');
                console.log('🗑️ Removed imageSearchResults from sessionStorage');
              }, 100);
              
              // Only show message for new searches and only once
              if (shouldShowMessage) {
                hasShownMessageRef.current = true;
                message.success(`Found ${mappedResults.length} similar products`);
              }
            } else {
              console.log('⚠️ Image results array is empty');
              setSearchResults([]);
              sessionStorage.removeItem('imageSearchResults');
              sessionStorage.removeItem('imageSearchLoading');
            }
          } catch (error) {
            console.error('❌ Image search parsing error:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : undefined);
            setSearchResults([]);
            message.error('Error processing image search results');
            sessionStorage.removeItem('imageSearchLoading');
          } finally {
            setIsSearching(false); // Stop loading
          }
        } else {
          console.log('⚠️ No imageSearchResults found in sessionStorage');
          setSearchResults([]);
          sessionStorage.removeItem('imageSearchLoading');
          setIsSearching(false);
        }
      } else {
        // Clear search results if no search query
        console.log('🧹 Clearing search results (no query or invalid mode)', { searchQuery, searchMode });
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [searchQuery, searchMode, message]);

  // Fetch products using TanStack Query
  const {
    data: regularProducts = [],
    isLoading: isLoadingRegular,
    isFetching: isFetchingRegular,
    isError,
    refetch
  } = useQuery({
    queryKey: ['products', category, sortBy, categories.length],
    queryFn: async () => {
      let allProducts: Product[] = [];

      // If 'all' selected, fetch all products and shuffle (like home)
      if (category === 'all') {
        allProducts = await productService.getAllProducts();
        allProducts = [...allProducts].sort(() => Math.random() - 0.5);
      } else {
        // Find the selected category by id or slug
        const selectedCategory = categories.find(cat =>
          cat.name.toLowerCase().replace(/\s+/g, '-') === category ||
          cat.id === category
        );

        if (selectedCategory) {
          // Use ProductService helper to fetch by category id
          try {
            allProducts = await productService.getProductsByCategory(selectedCategory.id);
          } catch (error) {
            console.error('Error fetching products by category via service:', error);
            allProducts = [];
          }
        } else {
          // If category not found, return empty
          allProducts = [];
        }
      }

      // Sort products based on sortBy
      const sortedProducts = [...allProducts].sort((a, b) => {
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
            return 0;
        }
      });

      return sortedProducts;
    },
    enabled: !searchQuery && categories.length > 0, // Only fetch when not searching and categories loaded
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Determine which products to display
  const products = searchQuery ? searchResults : regularProducts;
  const isLoading = searchQuery ? isSearching : isLoadingRegular;
  const isFetching = searchQuery ? isSearching : isFetchingRegular;
  
  // Show loading skeleton when:
  // 1. Currently loading/fetching data
  // 2. Or when products array is empty AND still fetching AND not an error
  const shouldShowLoading = isFetching || isLoading || (products.length === 0 && !isError && categories.length > 0);

  // Debug logging after every render
  useEffect(() => {
    console.log('📊 Display state (after render):', {
      searchQuery,
      searchMode,
      searchResultsCount: searchResults.length,
      regularProductsCount: regularProducts.length,
      displayProductsCount: products.length,
      isLoading,
      isSearching,
      firstProduct: products[0],
      searchResults_sample: searchResults[0],
      products_array: products
    });
  }, [searchQuery, searchMode, searchResults, regularProducts, products, isLoading, isSearching]);

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
        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <SearchOutlined className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {searchMode === 'image' ? 'Image Search Results' : `Search results for "${searchQuery}"`}
                </h3>
                <p className="text-sm text-gray-600">
                  {isSearching ? 'Searching...' : `Found ${products.length} products`}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear Search ✕
            </button>
          </div>
        )}

        {/* Category Filter Pills */}
        {!searchQuery && (
          <div className="mb-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FilterOutlined className="text-blue-600" />
              Filter by Category
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/products?category=all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  category === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/products?category=${cat.id}`)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    category === cat.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
        {shouldShowLoading ? (
          // Loading skeleton
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }>
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl p-4 animate-pulse">
                <div className={`bg-gray-200 rounded-xl mb-3 ${
                  viewMode === "list" ? "w-48 h-48" : "w-full h-44"
                }`}></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          // Error state
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😵</div>
            <div className="text-gray-400 text-xl mb-2">Unable to load products</div>
            <div className="text-gray-500 text-sm mb-6">Please try again later</div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-md transition-all"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          // Empty state (only show after successful load with no results)
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <div className="text-gray-400 text-xl mb-2">No products found</div>
            <div className="text-gray-500 text-sm mb-6">
              {searchQuery 
                ? `No products found for "${searchQuery}"`
                : 'No products available in this category'
              }
            </div>
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              onClick={() => router.push('/home')}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }>
            {products.map((product: Product) => {
              console.log('🎨 Rendering product:', product.id, product.name);
              const variant = product.variants?.[0];
              
              // Check for flash sale
              const hasFlashSale = variant?.isFlashSaleActive || false;
              const price = variant?.effectivePrice || variant?.price || 0;
              const originalPrice = variant?.price || 0;
              const discount = variant?.discountPercent || 0;
              const flashSaleQty = variant?.flashSaleQuantity || 0;
              
              return (
              <div
                key={product.id}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden ${
                  hasFlashSale ? 'border-2 border-red-100' : 'border border-gray-100'
                } ${
                  viewMode === "list" ? "flex items-center" : ""
                }`}
                onClick={() => router.push(`/product/${product.id}`)}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden ${
                  viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "w-full aspect-square"
                }`}>
                  <div className={`w-full h-full flex items-center justify-center ${
                    hasFlashSale ? 'bg-gradient-to-br from-red-50 to-orange-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                  }`}>
                    {product.images?.[0] ? (
                      <Image 
                        src={getCloudinaryUrl(product.images[0])} 
                        alt={product.name}
                        width={300}
                        height={300}
                        priority
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm text-center px-4">
                        {product.name}
                      </span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {hasFlashSale && discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg animate-pulse">
                      ⚡ -{discount}%
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <div 
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.id && <WishlistButton productId={product.id} size="small" />}
                  </div>

                  {/* View Details Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white font-semibold text-sm px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                      View Details →
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className={`p-4 ${
                  viewMode === "list" ? "flex-1" : ""
                }`}>
                  {/* Product Name */}
                  <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${
                    viewMode === "list" ? "text-xl mb-3" : "text-sm h-10"
                  }`}>
                    {product.name}
                  </h3>
                  
                  {/* Brand */}
                  {product.brand && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {product.brand}
                      </span>
                    </div>
                  )}
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarFilled key={star} className="text-yellow-400 text-xs" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">4.8</span>
                    <span className="text-xs text-gray-400">(256)</span>
                  </div>

                  {/* Price */}
                  {hasFlashSale ? (
                    <div>
                      <div className="flex flex-col gap-0.5 mb-1">
                        <div className={`text-gray-400 line-through ${
                          viewMode === "list" ? "text-base" : "text-xs"
                        }`}>
                          ${originalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-red-600 font-bold ${
                          viewMode === "list" ? "text-2xl" : "text-lg"
                        }`}>
                          ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                          Flash Sale
                        </span>
                        <span className="text-green-600 font-semibold">
                          Save ${(originalPrice - price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      {flashSaleQty > 0 && (
                        <div className="text-xs text-red-600 font-semibold text-center bg-red-50 py-1 rounded mb-2">
                          ⚡ Only {flashSaleQty} left!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className={`font-bold text-blue-600 ${
                        viewMode === "list" ? "text-2xl" : "text-lg"
                      }`}>
                        ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}

                  {/* Shop Info */}
                  {product.shop?.name && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 truncate">
                        <ShoppingCartOutlined className="mr-1" />
                        {product.shop.name}
                      </p>
                    </div>
                  )}
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