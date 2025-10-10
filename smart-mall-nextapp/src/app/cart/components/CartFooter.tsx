"use client";

import React from "react";
import type { CartItem } from "@/contexts/CartContext";
import { Button, Checkbox } from "antd";
import { useRouter } from "next/navigation";

interface CartFooterProps {
  items: CartItem[];
  selectedItems: string[];
  totalCount: number;
  selectAll: boolean;
  selectedTotal: number;
  onSelectAll: (checked: boolean) => void;
}

export default function CartFooter({
  items,
  selectedItems,
  totalCount,
  selectAll,
  selectedTotal,
  onSelectAll
}: CartFooterProps) {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <Checkbox 
              checked={selectAll}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="text-blue-600"
            >
              <span className="text-sm font-medium">Select All ({totalCount} items)</span>
            </Checkbox>
            <div className="hidden md:flex items-center space-x-4">
              <Button type="link" size="small" className="text-gray-600 hover:text-red-500">
                Delete Selected
              </Button>
              <Button type="link" size="small" className="text-gray-600 hover:text-blue-500">
                Save for Later
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                Total ({selectedItems.length} selected items)
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ${selectedTotal.toLocaleString()}
              </div>
            </div>
            <Button 
              type="primary" 
              size="large"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-none text-white font-semibold px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={selectedItems.length === 0}
              onClick={() => {
                // Store selected items in sessionStorage for checkout
                const selectedItemsData = items.filter(item => selectedItems.includes(item.cartItemId));
                sessionStorage.setItem('checkout_items', JSON.stringify(selectedItemsData));
                router.push('/checkout');
              }}
            >
              Checkout ({selectedItems.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}