"use client";

import React, { useState, useEffect, useRef } from "react";
import { HeartFilled, HeartOutlined, LoadingOutlined } from "@ant-design/icons";
import wishlistService from "@/services/WishlistService";
import { App } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string | undefined;
  productName?: string;
  size?: "small" | "medium" | "large";
  showText?: boolean;
  className?: string;
  onToggle?: (inWishlist: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  productName = "Product",
  size = "medium",
  showText = false,
  className = "",
  onToggle,
}) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { message } = App.useApp();
  const { status } = useAuth();
  const router = useRouter();
  
  // Prevent duplicate checks for the same product
  const hasCheckedRef = useRef(false);
  const lastProductIdRef = useRef<string | undefined>();

  useEffect(() => {
    if (!productId) {
      setChecking(false);
      hasCheckedRef.current = false;
      return;
    }
    
    // Reset check flag if productId changed
    if (lastProductIdRef.current !== productId) {
      hasCheckedRef.current = false;
      lastProductIdRef.current = productId;
    }
    
    // Only check if authenticated and haven't checked this product yet
    if (status === "authenticated" && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkWishlist();
    } else if (status !== "authenticated") {
      setChecking(false);
      hasCheckedRef.current = false;
    }
  }, [productId, status]);

  const checkWishlist = async () => {
    if (!productId) return;
    try {
      setChecking(true);
      const isInWishlist = await wishlistService.checkInWishlist(productId);
      setInWishlist(isInWishlist);
    } catch (error) {
      // Silently fail
      setInWishlist(false);
    } finally {
      setChecking(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) return;

    // Check authentication
    if (status !== "authenticated") {
      message.warning("Please login to add to wishlist");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setInWishlist(false);
        message.success(`Removed from wishlist`);
        onToggle?.(false);
      } else {
        await wishlistService.addToWishlist(productId);
        setInWishlist(true);
        message.success(`Added to wishlist`);
        onToggle?.(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to update wishlist";
      if (errorMsg.includes("already in wishlist")) {
        message.info("This product is already in your wishlist");
        setInWishlist(true);
      } else {
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Size configurations
  const sizeClasses = {
    small: {
      button: "w-8 h-8 text-sm",
      icon: "text-base",
      text: "text-xs",
    },
    medium: {
      button: "w-10 h-10 text-base",
      icon: "text-xl",
      text: "text-sm",
    },
    large: {
      button: "w-12 h-12 text-lg",
      icon: "text-2xl",
      text: "text-base",
    },
  };

  const sizeConfig = sizeClasses[size];

  if (!productId) return null;

  if (checking) {
    return (
      <button
        className={`${sizeConfig.button} bg-gray-100 rounded-full flex items-center justify-center ${className}`}
        disabled
      >
        <LoadingOutlined className={`${sizeConfig.icon} text-gray-400 animate-spin`} />
      </button>
    );
  }

  if (showText) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
          inWishlist
            ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
            : "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:text-red-600 hover:border-red-200"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      >
        {loading ? (
          <LoadingOutlined className={sizeConfig.icon} />
        ) : inWishlist ? (
          <HeartFilled className={`${sizeConfig.icon} text-red-500`} />
        ) : (
          <HeartOutlined className={sizeConfig.icon} />
        )}
        <span className={sizeConfig.text}>
          {loading ? "..." : inWishlist ? "In Wishlist" : "Add to Wishlist"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeConfig.button} rounded-full flex items-center justify-center transition-all shadow-lg
        ${
          inWishlist
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 border-2 border-gray-200 hover:border-red-300"
        }
        ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-110"}
        ${className}`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        <LoadingOutlined className={`${sizeConfig.icon} animate-spin`} />
      ) : inWishlist ? (
        <HeartFilled className={sizeConfig.icon} />
      ) : (
        <HeartOutlined className={sizeConfig.icon} />
      )}
    </button>
  );
};

export default WishlistButton;
