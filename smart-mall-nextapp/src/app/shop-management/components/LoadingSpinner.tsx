"use client";

import { LoadingOutlined } from "@ant-design/icons";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export default function LoadingSpinner({ message = "Loading...", size = "medium" }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl", 
    large: "text-6xl"
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Main spinner */}
        <LoadingOutlined className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        
        {/* Decorative rings */}
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
        <div className="absolute inset-2 border-2 border-purple-200 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {message && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
}