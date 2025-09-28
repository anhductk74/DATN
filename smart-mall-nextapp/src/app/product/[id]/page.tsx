"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  CrownOutlined
} from "@ant-design/icons";
import { useSession } from "next-auth/react";

export default function ProductDetail() {
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedSize, setSelectedSize] = useState("256GB");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const router = useRouter();
  const params = useParams();
  const {data: session} = useSession();
  
  useEffect(() => {
    const loggedIn = session?.user?.email ? true : false; 
    
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    
    setIsLoggedIn(true);
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [router]);

  // Mock product data - trong thực tế sẽ fetch từ API dựa trên params.id
  const product = {
    id: params.id,
    name: "iPhone 15 Pro Max AI Enhanced",
    brand: "Apple",
    price: 1299,
    originalPrice: 1599,
    discount: 19,
    rating: 4.8,
    reviewCount: 2847,
    isNew: true,
    colors: ["Black", "Blue", "White", "Gold"],
    sizes: ["128GB", "256GB", "512GB", "1TB"],
    images: [
      "/api/placeholder/500/500",
      "/api/placeholder/500/500", 
      "/api/placeholder/500/500",
      "/api/placeholder/500/500"
    ],
    description: "Experience the future with the iPhone 15 Pro Max featuring revolutionary AI integration, titanium design, and advanced camera system that captures life in stunning detail.",
    features: [
      "A17 Pro chip with 6-core GPU",
      "Pro camera system (48MP Main)",
      "Up to 29 hours video playback",
      "Titanium design",
      "Action Button",
      "USB-C connectivity"
    ],
    specifications: {
      "Display": "6.7-inch Super Retina XDR",
      "Chip": "A17 Pro",
      "Camera": "48MP Main, 12MP Ultra Wide",
      "Video": "4K Dolby Vision up to 60 fps",
      "Battery": "Up to 29 hours video",
      "Storage": "128GB, 256GB, 512GB, 1TB",
      "Material": "Titanium",
      "OS": "iOS 17"
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic - would integrate with state management in real app
    // TODO: Implement cart functionality
    // Data: product.name, selectedColor, selectedSize, quantity
  };

  const handleBuyNow = () => {
    // Buy now logic - would integrate with checkout in real app
    // TODO: Implement buy now functionality
    // Data: product.name, selectedColor, selectedSize, quantity
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header  />
      
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
                <span className="text-gray-400 text-lg font-medium">Product Image {selectedImage + 1}</span>
                
                {product.isNew && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    NEW
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}%
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <LeftOutlined className="text-gray-600" />
              </button>
              <button 
                onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <RightOutlined className="text-gray-600" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    selectedImage === index ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <span className="text-gray-400 text-sm">Img {index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
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
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarFilled key={star} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
                <span className="text-blue-600 hover:underline cursor-pointer">Write a review</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-red-500">${product.price}</span>
              <span className="text-2xl text-gray-500 line-through">${product.originalPrice}</span>
              <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                Save ${product.originalPrice - product.price}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Color: {selectedColor}</h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                      selectedColor === color ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    } ${
                      color === 'Black' ? 'bg-gray-800' :
                      color === 'Blue' ? 'bg-blue-500' :
                      color === 'White' ? 'bg-white' :
                      'bg-yellow-400'
                    }`}
                  >
                    {selectedColor === color && (
                      <CheckCircleOutlined className="text-blue-500 text-lg" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage: {selectedSize}</h3>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 rounded-2xl border-2 font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {size}
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
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-r-2xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">Available: 50+ items</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <ThunderboltOutlined className="mr-2" />
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <ShoppingCartOutlined className="mr-2" />
                  Add to Cart
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
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Key Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-900">{key}:</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <StarFilled className="text-6xl text-yellow-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                  <p className="text-gray-600">Reviews feature coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}