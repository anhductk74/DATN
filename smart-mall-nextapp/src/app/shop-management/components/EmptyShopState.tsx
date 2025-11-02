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
    <div className="relative min-h-[60vh] flex items-center justify-center bg-white">
      <div className="relative text-center max-w-2xl mx-auto px-4">
        {/* Main Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-blue-100">
            <ShopOutlined className="text-6xl text-blue-500" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Business Journey
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            You haven&apos;t created your shop yet. Create your shop today and start selling your products.
          </p>
          
          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShopOutlined className="text-white text-lg" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Professional Store</h4>
              <p className="text-gray-600 text-xs">Create a professional online store</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <RocketOutlined className="text-white text-lg" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Easy Management</h4>
              <p className="text-gray-600 text-xs">Manage products and orders easily</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrophyOutlined className="text-white text-lg" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Grow Sales</h4>
              <p className="text-gray-600 text-xs">Reach more customers</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative">
          <button
            onClick={onCreateShop}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-base shadow-md hover:shadow-lg"
          >
            <PlusOutlined className="text-lg" />
            <span>Create Your Shop Now</span>
          </button>
          
          <p className="text-gray-500 mt-4 text-sm">
            It only takes a few minutes to set up
          </p>
        </div>
      </div>
    </div>
  );
}