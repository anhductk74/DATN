"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CartHeaderProps {
  onLogoClick?: () => void;
}

export default function CartHeader({ onLogoClick }: CartHeaderProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center hover:scale-110 transition-transform">
                <span className="text-purple-600 font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold hover:text-purple-100 transition-colors">SmartMall</span>
              <span className="text-purple-200 mx-2">|</span>
              <span className="text-lg">Shopping Cart</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="px-4 py-2 pr-12 rounded-sm text-gray-800 placeholder-gray-500 w-96 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
              <button className="absolute right-0 top-0 bottom-0 bg-orange-500 hover:bg-orange-600 px-4 rounded-r-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}