"use client";

import React from "react";
import { Checkbox } from "antd";
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
  return (
    <div className="bg-white rounded-lg overflow-hidden mb-4">
      {/* Table Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <div className="w-6">
            <Checkbox 
              checked={selectAll} 
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          </div>
          <div className="flex-1 ml-4 text-sm font-medium text-gray-700">Product</div>
          <div className="w-32 text-center text-sm font-medium text-gray-700">Unit Price</div>
          <div className="w-32 text-center text-sm font-medium text-gray-700">Quantity</div>
          <div className="w-32 text-center text-sm font-medium text-gray-700">Total Price</div>
          <div className="w-16 text-center text-sm font-medium text-gray-700">Actions</div>
        </div>
      </div>

      {/* Cart Items */}
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          isSelected={selectedItems.includes(item.id)}
          onSelect={onSelectItem}
          onVoucherClick={onVoucherClick}
          onShippingInfoClick={onShippingInfoClick}
        />
      ))}
    </div>
  );
}