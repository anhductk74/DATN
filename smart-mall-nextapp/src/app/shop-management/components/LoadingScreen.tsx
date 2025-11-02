"use client";

import { ShopOutlined, LoadingOutlined } from "@ant-design/icons";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Shop Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto animate-pulse">
            <ShopOutlined className="text-5xl text-blue-500" />
          </div>
          
          {/* Spinning ring around icon */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24">
            <div className="w-full h-full border-4 border-blue-200 border-t-blue-500 rounded-2xl animate-spin"></div>
          </div>
        </div>

        {/* Loading spinner and text */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <LoadingOutlined className="text-2xl text-blue-500 animate-spin" />
            <p className="text-lg font-medium text-gray-700">{message}</p>
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
