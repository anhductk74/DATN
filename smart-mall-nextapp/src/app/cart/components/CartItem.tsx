"use client";

import React from "react";
import { Button, Checkbox, App } from "antd";
import { DeleteOutlined, ShopOutlined, GiftOutlined, TruckOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    shopName: string;
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
      title: 'Delete Product',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove "${item.title}" from your cart?`,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        removeItem(item.id);
      },
    });
  };

  return (
    <div className="border-b border-gray-100">
      {/* Shop Header */}
      <div className="bg-gray-50 px-6 py-3 flex items-center">
        <Checkbox checked={isSelected} onChange={(e) => onSelect(item.id, e.target.checked)} />
        <ShopOutlined className="ml-3 mr-2 text-orange-500" />
        <span className="text-sm font-medium">{item.shopName}</span>
        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">Mall</span>
      </div>

      {/* Product Item */}
      <div className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-6">
            <Checkbox 
              checked={isSelected}
              onChange={(e) => onSelect(item.id, e.target.checked)}
            />
          </div>
          <div className="flex-1 ml-4 flex items-center">
            <div className="w-20 h-20 bg-gray-100 rounded mr-4 overflow-hidden">
              <img 
                src={item.image || 'https://via.placeholder.com/80x80/f0f0f0/666?text=No+Image'} 
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80x80/f0f0f0/666?text=No+Image';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">{item.title}</div>
              <div className="text-xs text-gray-500 mb-1">{item.variant}</div>
              {item.sale && (
                <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                  <span className="mr-1">{item.sale}</span>
                  <span className="bg-red-500 text-white px-1 rounded text-xs">SALE</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-32 text-center">
            {item.originalPrice && (
              <div className="text-sm text-gray-400 line-through">
                {item.originalPrice.toLocaleString()} VND
              </div>
            )}
            <div className="text-sm font-semibold text-red-600">
              {item.price.toLocaleString()} VND
            </div>
          </div>
          <div className="w-32 text-center">
            <div className="flex items-center justify-center">
              <Button 
                size="small" 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span className="mx-3 min-w-[40px] text-center">{item.quantity}</span>
              <Button 
                size="small" 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          <div className="w-32 text-center">
            <div className="text-sm font-semibold text-red-600">
              {(item.price * item.quantity).toLocaleString()} VND
            </div>
          </div>
          <div className="w-16 text-center">
            <Button 
              type="text" 
              size="small"
              icon={<DeleteOutlined />} 
              onClick={handleDeleteItem}
              className="text-gray-400 hover:text-red-500"
            />
          </div>
        </div>
      </div>

      {/* Shop Vouchers */}
      <div className="px-6 py-3 bg-gray-25 border-t border-gray-100">
        <div className="flex items-center py-2">
          <GiftOutlined className="text-orange-500 mr-3" />
          <div className="flex-1">
            <span className="text-sm text-gray-700">Voucher discount up to 90k</span>
          </div>
          <Button type="link" size="small" className="text-blue-500" onClick={onVoucherClick}>
            View more vouchers
          </Button>
        </div>
        <div className="flex items-center py-2">
          <TruckOutlined className="text-orange-500 mr-3" />
          <div className="flex-1">
            <span className="text-sm text-gray-700">Free shipping discount 500,000 VND minimum order 0 VND; 501,000 VND discount minimum order 500,000 VND</span>
          </div>
          <Button type="link" size="small" className="text-blue-500" onClick={onShippingInfoClick}>
            Learn more
          </Button>
        </div>
      </div>
    </div>
  );
}