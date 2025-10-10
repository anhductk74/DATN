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
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm">
            <img 
              src={getCloudinaryUrl(item.image)} 
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-3 md:space-y-0">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              {item.variant && (
                <p className="text-sm text-gray-600 mb-2">{item.variant}</p>
              )}
              {item.sale && (
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
              <div className="text-center">
                {item.originalPrice && (
                  <div className="text-sm text-gray-400 line-through mb-1">
                    ${item.originalPrice.toLocaleString()}
                  </div>
                )}
                <div className="text-lg font-bold text-red-600">
                  ${item.price.toLocaleString()}
                </div>
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
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  ${(item.price * item.quantity).toLocaleString()}
                </div>
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
                  {item.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">
                      ${item.originalPrice.toLocaleString()}
                    </div>
                  )}
                  <div className="text-lg font-bold text-red-600">
                    ${item.price.toLocaleString()}
                  </div>
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
                <div className="text-lg font-bold text-gray-900">
                  ${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}