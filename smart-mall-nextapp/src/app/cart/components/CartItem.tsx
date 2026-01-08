"use client";

import React from "react";
import { Button, Checkbox, App } from "antd";
import { DeleteOutlined, ShopOutlined, GiftOutlined, TruckOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useCart } from "@/contexts/CartContext";
import { getCloudinaryUrl } from "@/config/config";

interface CartItemProps {
  item: {
    cartItemId: string;
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    shopName?: string;
    shopId?: string;
    brand?: string;
    variant?: string;
    sale?: string;
    // Flash sale fields
    isFlashSaleActive?: boolean;
    effectivePrice?: number;
    flashSalePrice?: number;
    discountPercent?: number;
    flashSaleQuantity?: number;
    flashSaleStart?: string;
    flashSaleEnd?: string;
  };
  isSelected: boolean;
  onSelect: (itemId: string, checked: boolean) => void;
  onVoucherClick: () => void;
  onShippingInfoClick: () => void;
}

export default function CartItem({
  item,
  isSelected,
  onSelect,
  onVoucherClick,
  onShippingInfoClick
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { modal } = App.useApp();

  // Flash sale calculations
  const hasFlashSale = item.isFlashSaleActive || false;
  const displayPrice = item.effectivePrice || item.price;
  const originalPrice = item.price;
  const discount = item.discountPercent || 0;

  const handleDeleteItem = () => {
    modal.confirm({
      title: 'Xóa sản phẩm',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa "${item.title}" khỏi giỏ hàng?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk() {
        removeItem(item.cartItemId);
      },
    });
  };

  return (
    <div className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-2">
          <Checkbox 
            checked={isSelected}
            onChange={(e) => onSelect(item.cartItemId, e.target.checked)}
            className="text-blue-600"
          />
        </div>

        {/* Product Image */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
            <img 
              src={getCloudinaryUrl(item.image)} 
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
          {hasFlashSale && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
              -{discount}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-3 md:space-y-0">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              {item.variant && (
                <p className="text-sm text-gray-600 mb-2">{item.variant}</p>
              )}
              {hasFlashSale && (
                <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 text-sm rounded-full font-medium mb-2 border border-red-200">
                  🔥 Flash Sale - Save ${(originalPrice - displayPrice).toLocaleString()}
                </div>
              )}
              {item.sale && !hasFlashSale && (
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium mb-2">
                  🔥 {item.sale}
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Brand: {item.brand}</span>
              </div>
            </div>

            {/* Desktop Layout - Price, Quantity, Actions */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Price */}
              <div className="text-center min-w-[100px]">
                {hasFlashSale ? (
                  <div className="flex flex-col items-center">
                    <div className="text-sm text-gray-400 line-through mb-1">
                      ${originalPrice.toLocaleString()}
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      ${displayPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-orange-600 font-semibold mt-1">
                      🔥 Flash Sale
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-900">
                    ${displayPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-3">
                <Button 
                  size="small" 
                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-lg border-gray-300 hover:border-blue-500 hover:text-blue-500"
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{item.quantity}</span>
                <Button 
                  size="small" 
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border-gray-300 hover:border-blue-500 hover:text-blue-500"
                >
                  +
                </Button>
              </div>

              {/* Total */}
              <div className="text-center min-w-[100px]">
                <div className="text-lg font-bold text-gray-900">
                  ${(displayPrice * item.quantity).toLocaleString()}
                </div>
                {hasFlashSale && item.flashSaleQuantity && (
                  <div className="text-xs text-orange-600 font-semibold mt-1">
                    Only {item.flashSaleQuantity} left!
                  </div>
                )}
              </div>

              {/* Delete */}
              <Button 
                type="text" 
                size="small"
                icon={<DeleteOutlined />} 
                onClick={handleDeleteItem}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg"
              />
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  {hasFlashSale ? (
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-400 line-through">
                        ${originalPrice.toLocaleString()}
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        ${displayPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-orange-600 font-semibold mt-1">
                        🔥 Flash Sale
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-900">
                      ${displayPrice.toLocaleString()}
                    </div>
                  )}
                </div>
                <Button 
                  type="text" 
                  size="small"
                  icon={<DeleteOutlined />} 
                  onClick={handleDeleteItem}
                  className="text-gray-400 hover:text-red-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button 
                    size="small" 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-lg"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <Button 
                    size="small" 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg"
                  >
                    +
                  </Button>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-gray-900">
                    ${(displayPrice * item.quantity).toLocaleString()}
                  </div>
                  {hasFlashSale && item.flashSaleQuantity && (
                    <div className="text-xs text-orange-600 font-semibold mt-1">
                      Only {item.flashSaleQuantity} left!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}