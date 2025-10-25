"use client";

import { 
  ShopOutlined,
  PlusOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined
} from "@ant-design/icons";

interface EmptyShopStateProps {
  onCreateShop: () => void;
}

export default function EmptyShopState({ onCreateShop }: EmptyShopStateProps) {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-purple-100 rounded-full opacity-60 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-pink-100 rounded-full opacity-60 animate-pulse delay-1000"></div>
      </div>

      <div className="relative text-center max-w-2xl mx-auto px-4">
        {/* Main Icon */}
        <div className="relative mb-8">
          <div className="w-40 h-40 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
              <ShopOutlined className="text-6xl text-gray-600" />
            </div>
          </div>
          
          {/* Floating Icons */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <StarOutlined className="text-white text-lg" />
            </div>
          </div>
          <div className="absolute top-8 right-8">
            <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-300">
              <TrophyOutlined className="text-white" />
            </div>
          </div>
          <div className="absolute top-8 left-8">
            <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
              <RocketOutlined className="text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Business Journey
          </h3>
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            You haven&apos;t created your shop yet. Create your shop today and start selling your amazing products to customers worldwide.
          </p>
          
          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShopOutlined className="text-white text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Professional Store</h4>
              <p className="text-gray-600 text-sm">Create a beautiful, professional online store</p>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RocketOutlined className="text-white text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Easy Management</h4>
              <p className="text-gray-600 text-sm">Manage products, orders, and customers effortlessly</p>
            </div>
            
            <div className="bg-purple-50 rounded-2xl p-6 hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrophyOutlined className="text-white text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Grow Sales</h4>
              <p className="text-gray-600 text-sm">Reach more customers and increase your revenue</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative">
          <button
            onClick={onCreateShop}
            className="group relative inline-flex items-center space-x-3 px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 font-bold text-lg overflow-hidden"
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <PlusOutlined className="text-xl" />
              </div>
              <span>Create Your Shop Now</span>
            </div>
            
            {/* Sparkle Effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
          </button>
          
          <p className="text-gray-500 mt-4 text-sm">
            It only takes a few minutes to set up your shop
          </p>
        </div>
      </div>
    </div>
  );
}