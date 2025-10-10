"use client";

import React from "react";
import { Checkbox } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import CartItem from "./CartItem";

interface CartTableProps {
  items: any[];
  selectedItems: string[];
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (itemId: string, checked: boolean) => void;
  onVoucherClick: () => void;
  onShippingInfoClick: () => void;
}

export default function CartTable({
  items,
  selectedItems,
  selectAll,
  onSelectAll,
  onSelectItem,
  onVoucherClick,
  onShippingInfoClick
}: CartTableProps) {
  // Group items by shop
  const groupedItems = items.reduce((groups: { [key: string]: any[] }, item) => {
    const shopKey = item.shopId || item.shopName || 'Unknown Shop';
    if (!groups[shopKey]) {
      groups[shopKey] = [];
    }
    groups[shopKey].push(item);
    return groups;
  }, {});

  // Helper function to check if all items in a shop are selected
  const isShopAllSelected = (shopItems: any[]) => {
    return shopItems.every(item => selectedItems.includes(item.cartItemId));
  };

  // Helper function to check if some items in a shop are selected
  const isShopPartiallySelected = (shopItems: any[]) => {
    const selectedCount = shopItems.filter(item => selectedItems.includes(item.cartItemId)).length;
    return selectedCount > 0 && selectedCount < shopItems.length;
  };

  // Handle shop selection
  const handleShopSelectAll = (shopItems: any[], checked: boolean) => {
    shopItems.forEach(item => {
      const isCurrentlySelected = selectedItems.includes(item.cartItemId);
      if (checked && !isCurrentlySelected) {
        onSelectItem(item.cartItemId, true);
      } else if (!checked && isCurrentlySelected) {
        onSelectItem(item.cartItemId, false);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Global Header */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200 px-6 py-5 mb-4">
        <div className="flex items-center">
          <div className="w-6">
            <Checkbox 
              checked={selectAll} 
              onChange={(e) => onSelectAll(e.target.checked)}
              className="text-blue-600 scale-110"
            />
          </div>
          <div className="flex-1 ml-4">
            <div className="text-lg font-bold text-gray-900">Select All Products</div>
            <div className="text-sm text-gray-500 mt-1">Choose items you want to purchase</div>
          </div>
          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <div className="w-24 text-center">Price</div>
            <div className="w-24 text-center">Quantity</div>
            <div className="w-24 text-center">Total</div>
            <div className="w-16 text-center">Remove</div>
          </div>
        </div>
      </div>

      {/* Grouped Items by Shop */}
      {Object.entries(groupedItems).map(([shopKey, shopItems]) => {
        const shopName = shopItems[0]?.shopName || 'Unknown Shop';
        const shopId = shopItems[0]?.shopId;
        
        return (
          <div key={shopKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            {/* Shop Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox 
                    checked={isShopAllSelected(shopItems)}
                    indeterminate={isShopPartiallySelected(shopItems)}
                    onChange={(e) => handleShopSelectAll(shopItems, e.target.checked)}
                    className="mr-4 text-blue-600 scale-110"
                  />
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <ShopOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xl">{shopName}</div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {shopItems.length} {shopItems.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-green-600 font-medium">🚚 Free shipping over $50</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Verified Store
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ${shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Items */}
            <div className="divide-y divide-gray-100">
              {shopItems.map((item, index) => (
                <div key={item.cartItemId}>
                  <CartItem
                    item={item}
                    isSelected={selectedItems.includes(item.cartItemId)}
                    onSelect={onSelectItem}
                    onVoucherClick={onVoucherClick}
                    onShippingInfoClick={onShippingInfoClick}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}