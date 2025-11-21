"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import NextImage from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import productService from "@/services/ProductService";
import { App, Avatar, Modal, Image } from "antd";
import { getCloudinaryUrl } from "@/config/config";
import { 
  HeartOutlined,
  HeartFilled,
  StarFilled,
  ShoppingCartOutlined,
  ShareAltOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  LoadingOutlined,
  ShopOutlined
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import reviewApiService, { ReviewResponseDto, ReviewStatisticsDto } from "@/services/ReviewApiService";

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  // Reviews state
  const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatisticsDto | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  // Review image modal state
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { status } = useAuth();
  const { addItem } = useCart();
  const { message } = App.useApp();
  const productId = params.id as string;

  // Auth check
  useEffect(() => {
    // if (status === "loading") return; // Wait for auth state to load
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  // Fetch product details using TanStack Query
  const {
    data: product,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      return await productService.getProductById(productId);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Set default selected variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0].id || "");
    }
  }, [product, selectedVariant]);

  // Fetch reviews and stats when product loads or tab changes to reviews
  useEffect(() => {
    if (productId && (activeTab === 'reviews' || product)) {
      fetchReviews(0, false);
      fetchReviewStats();
    }
  }, [productId, activeTab, product]);

  // Get selected variant details
  const currentVariant = product?.variants?.find(v => v.id === selectedVariant) || product?.variants?.[0];
  const currentPrice = currentVariant?.price || 0;
  const originalPrice = Math.round(currentPrice * 1.3); // Mock original price
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  // Extract unique attribute values for selection
  const getUniqueAttributes = (attributeName: string) => {
    if (!product?.variants) return [];
    const values = product.variants
      .flatMap(v => v.attributes?.filter(attr => attr.attributeName === attributeName) || [])
      .map(attr => attr.attributeValue);
    return [...new Set(values)];
  };

  // Fetch reviews for the product
  const fetchReviews = async (page = 0, append = false) => {
    if (!productId) return;
    
    try {
      setReviewsLoading(true);
      const response = await reviewApiService.getReviewsByProduct(productId, page, 5);
      
      if (append) {
        setReviews(prev => [...prev, ...response.content]);
      } else {
        setReviews(response.content);
      }
      
      setTotalReviews(response.totalElements);
      setHasMoreReviews(!response.last);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      message.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch review statistics
  const fetchReviewStats = async () => {
    if (!productId) return;
    
    try {
      const stats = await reviewApiService.getReviewStatistics(productId);
      setReviewStats(stats);
    } catch (error) {
      console.error('Failed to fetch review statistics:', error);
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    if (hasMoreReviews && !reviewsLoading) {
      fetchReviews(currentPage + 1, true);
    }
  };

  // Refresh reviews (useful after submitting a new review)
  const refreshReviews = () => {
    setReviews([]);
    setCurrentPage(0);
    fetchReviews(0, false);
    fetchReviewStats();
  };

  // Helper function to render star rating with proper coloring
  const renderStarRating = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeConfig = {
      sm: { fontSize: '16px' },
      md: { fontSize: '20px' }, 
      lg: { fontSize: '24px' }
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarFilled 
            key={star} 
            style={{
              ...sizeConfig[size],
              color: star <= Math.floor(rating) ? '#fbbf24' : '#d1d5db',
              transition: 'color 0.2s'
            }}
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = async () => {
    if (!product || !currentVariant) {
      message.error("Please select a product variant");
      return;
    }

    if (!currentVariant.id) {
      message.error("Invalid product variant");
      return;
    }

    if (quantity > (currentVariant.stock || 0)) {
      message.error(`Only ${currentVariant.stock} items available in stock`);
      return;
    }

    try {
      setAddingToCart(true);
      await addItem(currentVariant.id, quantity);
      message.success(`Added ${quantity} x "${product.name}" to cart successfully!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      message.error("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !currentVariant) {
      message.error("Please select a product variant");
      return;
    }

    if (!currentVariant.id) {
      message.error("Invalid product variant");
      return;
    }

    if (quantity > (currentVariant.stock || 0)) {
      message.error(`Only ${currentVariant.stock} items available in stock`);
      return;
    }

    try {
      setBuyingNow(true);
      
      // Create checkout item format similar to cart
      const checkoutItem = {
        id: currentVariant.id,
        variantId: currentVariant.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        price: currentVariant.price,
        quantity: quantity,
        variant: currentVariant.attributes?.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(', ') || currentVariant.sku,
        shopId: product.shop?.id || 'unknown-shop',
        shopName: product.shop?.name || 'Unknown Shop',
        stock: currentVariant.stock,
        // Include additional product info for checkout
        productId: product.id,
        sku: currentVariant.sku,
        brand: product.brand,
        category: product.category?.name
      };

      // Store checkout items in sessionStorage
      sessionStorage.setItem('checkout_items', JSON.stringify([checkoutItem]));
      
      // Navigate to checkout
      router.push("/checkout");
    } catch (error) {
      console.error('Failed to prepare checkout:', error);
      message.error("Failed to prepare checkout. Please try again.");
    } finally {
      setBuyingNow(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingOutlined className="text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <div className="text-gray-400 text-xl mb-2">Product not found</div>
            <div className="text-gray-500 text-sm mb-6">The product you are looking for does not exist</div>
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              onClick={() => router.push('/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <button onClick={() => router.push("/products")} className="hover:text-blue-600 transition-colors">
              Products
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-3xl p-8 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <NextImage 
                    src={getCloudinaryUrl(product.images[selectedImage])} 
                    alt={product.name}
                    width={500}
                    height={500}
                    priority
                    className="object-cover rounded-2xl w-full h-full"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                ) : (
                  <span className="text-gray-400 text-lg font-medium text-center px-4">
                    {product.name}
                  </span>
                )}
                
                {product.status === 'ACTIVE' && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ACTIVE
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              </div>
              
              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images!.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <LeftOutlined className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage(prev => prev < product.images!.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <RightOutlined className="text-gray-600" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-200 ${
                      selectedImage === index ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <NextImage 
                      src={getCloudinaryUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      width={120}
                      height={120}
                      className="object-cover rounded-2xl w-full h-full"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Shop Info Banner */}
            {product.shop && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <ShopOutlined className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Sold by</div>
                      <button
                        onClick={() => router.push(`/shop-detail/${product.shop?.id}`)}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {product.shop.name}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/shop-detail/${product.shop?.id}`)}
                      className="border border-blue-600 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
                    >
                      View Shop
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Brand & Title */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-blue-600 font-semibold text-sm">{product.brand}</span>
                <div className="flex items-center space-x-1">
                  <CrownOutlined className="text-yellow-500 text-sm" />
                  <span className="text-yellow-600 text-sm font-medium">Premium</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                {renderStarRating(reviewStats?.averageRating || product.averageRating || 0, 'md')}
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-yellow-600">
                    {reviewStats?.averageRating 
                      ? reviewStats.averageRating.toFixed(1) 
                      : product.averageRating 
                        ? product.averageRating.toFixed(1)
                        : '0.0'
                    }
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">
                    {reviewStats?.totalReviews || product.reviewCount || 0} reviews
                  </span>
                </div>
                {/* <button 
                  onClick={() => setActiveTab('reviews')}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-2"
                >
                  Write a review
                </button> */}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-red-500">${currentPrice.toLocaleString()}</span>
              <span className="text-2xl text-gray-500 line-through">${originalPrice.toLocaleString()}</span>
              <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                Save ${(originalPrice - currentPrice).toLocaleString()}
              </div>
            </div>

            {/* Variant Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Variant: {currentVariant?.sku}</h3>
              <div className="space-y-3">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id || "")}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      selectedVariant === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{variant.sku}</div>
                        <div className="text-sm text-gray-600">
                          {variant.attributes?.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(', ')}
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          Stock: {variant.stock} available
                        </div>
                      </div>
                      <div className="text-lg font-bold text-red-500">
                        ${variant.price.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-2xl">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-l-2xl"
                  >
                    -
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(currentVariant?.stock || 0, prev + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-r-2xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">
                  Available: {currentVariant?.stock || 0} items
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow || addingToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {buyingNow ? (
                    <>
                      <LoadingOutlined className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ThunderboltOutlined className="mr-2" />
                      Buy Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || buyingNow}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {addingToCart ? (
                    <>
                      <LoadingOutlined className="mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCartOutlined className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex-1 border-2 py-3 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600'
                  }`}
                >
                  {isWishlisted ? <HeartFilled className="mr-2" /> : <HeartOutlined className="mr-2" />}
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
                <button className="border-2 border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-600 py-3 px-6 rounded-2xl font-semibold transition-all duration-200">
                  <ShareAltOutlined className="mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-2xl">
                <TruckOutlined className="text-green-600 text-xl" />
                <div>
                  <div className="font-semibold text-green-800">Free Shipping</div>
                  <div className="text-sm text-green-600">Orders over $50</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl">
                <SafetyOutlined className="text-blue-600 text-xl" />
                <div>
                  <div className="font-semibold text-blue-800">2 Year Warranty</div>
                  <div className="text-sm text-blue-600">Full coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">{product.description}</p>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Product Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">Brand: {product.brand}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">Category: {product.category?.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">
                        Shop:{" "}
                        <button
                          onClick={() => router.push(`/shop/${product.shop?.id}`)}
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          {product.shop?.name}
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">Status: {product.status}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">Variants: {product.variants?.length}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700">
                          Rating: {reviewStats?.averageRating 
                            ? reviewStats.averageRating.toFixed(1) 
                            : product.averageRating 
                              ? product.averageRating.toFixed(1)
                              : 'N/A'
                          }/5
                        </span>
                        {(reviewStats?.averageRating || product.averageRating) && 
                          renderStarRating(reviewStats?.averageRating || product.averageRating || 0, 'sm')
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">
                        Reviews: {reviewStats?.totalReviews || product.reviewCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Product Variants:</h4>
                {product.variants?.map((variant, index) => (
                  <div key={variant.id} className="bg-gray-50 rounded-2xl p-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">Variant {index + 1}: {variant.sku}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-900">Price:</span>
                          <span className="text-gray-700">${variant.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-900">Stock:</span>
                          <span className="text-gray-700">{variant.stock}</span>
                        </div>
                        {variant.weight && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-900">Weight:</span>
                            <span className="text-gray-700">{variant.weight}kg</span>
                          </div>
                        )}
                        {variant.dimensions && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-900">Dimensions:</span>
                            <span className="text-gray-700">{variant.dimensions}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-medium text-gray-900">Attributes:</h6>
                        {variant.attributes?.map((attr, attrIndex) => (
                          <div key={attrIndex} className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-900">{attr.attributeName}:</span>
                            <span className="text-gray-700">{attr.attributeValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Statistics */}
                {reviewStats && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Overall Rating */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-600 mb-2">
                          {reviewStats.averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {renderStarRating(reviewStats.averageRating, 'lg')}
                        </div>
                        <div className="text-gray-600">{reviewStats.totalReviews} reviews</div>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 w-8">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${reviewStats.totalReviews > 0 
                                    ? ((reviewStats.ratingCounts[rating] || 0) / reviewStats.totalReviews) * 100 
                                    : 0}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {reviewStats.ratingCounts[rating] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-gray-900">Customer Reviews</h4>
                  
                  {reviewsLoading && reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <LoadingOutlined className="text-2xl text-blue-600 mb-4" />
                      <p className="text-gray-600">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-10 h-10">
                                {review.userAvatar ? (
                                  <div className="relative">
                                    <Image
                                      src={`https://res.cloudinary.com${review.userAvatar}`}
                                      alt={`${review.userName}'s avatar`}
                                      width={40}
                                      height={40}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                      style={{ width: 'auto', height: 'auto' }}
                                      onError={(e) => {
                                        console.error('Failed to load user avatar:', review.userAvatar);
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.nextSibling) {
                                          (target.nextSibling as HTMLElement).style.display = 'flex';
                                        }
                                      }}
                                    />
                                    {/* Fallback avatar hidden by default, shown on image error */}
                                    <div 
                                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm absolute top-0 left-0"
                                      style={{ display: 'none' }}
                                    >
                                      <span className="text-white font-semibold text-sm">
                                        {review.userName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white font-semibold text-sm">
                                      {review.userName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{review.userName}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(review.reviewedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {renderStarRating(review.rating, 'sm')}
                              <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
                            </div>
                          </div>

                          {/* Review Content */}
                          <div className="mb-4">
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>

                          {/* Review Media */}
                          {review.mediaList && review.mediaList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {review.mediaList.map((media) => (
                                <div key={media.id} className="relative">
                                  {media.mediaType === 'IMAGE' ? (
                                    <Image
                                      src={getCloudinaryUrl(media.mediaUrl)}
                                      alt={`Review image`}
                                      className="rounded-lg object-cover"
                                      style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                                      fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23666'%3E📷%3C/text%3E%3C/svg%3E"
                                      preview={{
                                        src: getCloudinaryUrl(media.mediaUrl),
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 hover:border-blue-300 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                                      style={{ width: '96px', height: '96px' }}
                                      onClick={() => {
                                        window.open(getCloudinaryUrl(media.mediaUrl), '_blank');
                                      }}
                                    >
                                      <div className="text-center">
                                        <div className="text-gray-400 text-lg">🎥</div>
                                        <div className="text-gray-500 text-xs mt-1">Video</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Shop Reply */}
                          {review.shopReply && (
                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                              <div className="flex items-center space-x-2 mb-2">
                                <ShopOutlined className="text-blue-600" />
                                <span className="font-medium text-blue-900">{review.shopReply.shopName}</span>
                                <span className="text-sm text-blue-600">replied</span>
                              </div>
                              <p className="text-blue-800">{review.shopReply.content}</p>
                              <div className="text-xs text-blue-600 mt-2">
                                {new Date(review.shopReply.repliedAt).toLocaleDateString()}
                              </div>
                            </div>
                          )}

                          {/* Review Status */}
                          {review.isEdited && (
                            <div className="text-xs text-gray-500 mt-2">• Edited</div>
                          )}
                        </div>
                      ))}
                      
                      {/* Load More Button */}
                      {hasMoreReviews && (
                        <div className="text-center">
                          <button
                            onClick={loadMoreReviews}
                            disabled={reviewsLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-70"
                          >
                            {reviewsLoading ? (
                              <>
                                <LoadingOutlined className="mr-2" />
                                Loading...
                              </>
                            ) : (
                              'Load More Reviews'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <StarFilled style={{ fontSize: '48px', color: '#d1d5db' }} className="mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600 mb-4">Be the first to review this product!</p>
                      <p className="text-gray-500 text-sm">Share your experience to help other customers</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Image Modal */}
      <Modal
        open={!!selectedReviewImage}
        onCancel={() => setSelectedReviewImage(null)}
        footer={null}
        width="90vw"
        style={{ maxWidth: '800px' }}
        centered
        className="review-image-modal"
      >
        {selectedReviewImage && (
          <div className="flex items-center justify-center p-4">
            <Image
              src={selectedReviewImage}
              alt="Review image enlarged"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '80vh' }}
            />
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}