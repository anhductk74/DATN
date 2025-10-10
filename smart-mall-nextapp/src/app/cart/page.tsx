"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { useCart } from "@/contexts/CartContext";
import {
  CartTable,
  CartFooter,
  VoucherSection,
  VoucherModal,
  ShippingModal,
  EmptyCart,
  LoadingState
} from "./components";
import Header from "@/components/Header";

export default function CartPage() {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart, loading } = useCart();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [shippingInfoVisible, setShippingInfoVisible] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(items.map(item => item.cartItemId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      setSelectAll(false);
    }
  };

  const selectedItemsData = items.filter(item => selectedItems.includes(item.cartItemId));
  const selectedTotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update selectAll when all items are selected individually
  useEffect(() => {
    if (items.length > 0 && selectedItems.length === items.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems.length, items.length]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
        <Header />

      <div className="bg-gray-50 min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <CartTable
                items={items}
                selectedItems={selectedItems}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onVoucherClick={() => setVoucherModalVisible(true)}
                onShippingInfoClick={() => setShippingInfoVisible(true)}
              />
              
              <VoucherSection onVoucherClick={() => setVoucherModalVisible(true)} />
            </>
          )}
        </div>
      </div>

      <CartFooter
        items={items}
        selectedItems={selectedItems}
        totalCount={totalCount}
        selectAll={selectAll}
        selectedTotal={selectedTotal}
        onSelectAll={handleSelectAll}
      />

      <VoucherModal
        visible={voucherModalVisible}
        onClose={() => setVoucherModalVisible(false)}
      />

      <ShippingModal
        visible={shippingInfoVisible}
        onClose={() => setShippingInfoVisible(false)}
      />
    </>
  );
}
