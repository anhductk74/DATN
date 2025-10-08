"use client";

import React from "react";
import { Button, Checkbox } from "antd";
import { useRouter } from "next/navigation";

interface CartFooterProps {
  items: any[];
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Checkbox 
              checked={selectAll}
              onChange={(e) => onSelectAll(e.target.checked)}
            >
              <span className="text-sm">Select All ({totalCount})</span>
            </Checkbox>
            <Button type="link" size="small" className="text-gray-600">Delete</Button>
            <Button type="link" size="small" className="text-gray-600">Save for Later</Button>
            <Button type="link" size="small" className="text-blue-500">
              Find Similar Products
            </Button>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Total ({selectedItems.length} items): 
                <span className="text-2xl font-bold text-orange-500 ml-2">
                  {selectedTotal.toLocaleString()} VND
                </span>
              </div>
            </div>
            <Button 
              type="primary" 
              size="large"
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 text-white font-medium px-8 py-2 h-auto"
              disabled={selectedItems.length === 0}
              onClick={() => {
                // Store selected items in sessionStorage for checkout
                const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
                sessionStorage.setItem('checkout_items', JSON.stringify(selectedItemsData));
                router.push('/checkout');
              }}
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}