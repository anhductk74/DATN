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
  const { modal, message } = App.useApp();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [shippingInfoVisible, setShippingInfoVisible] = useState(false);
  const [deletingItems, setDeletingItems] = useState(false);

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

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      message.warning('Please select items to delete');
      return;
    }

    modal.confirm({
      title: 'Delete Selected Items',
      content: `Are you sure you want to delete ${selectedItems.length} selected item(s)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeletingItems(true);
          
          // Delete all selected items
          await Promise.all(
            selectedItems.map(itemId => removeItem(itemId))
          );
          
          // Clear selection
          setSelectedItems([]);
          setSelectAll(false);
          
          message.success(`Successfully deleted ${selectedItems.length} item(s)`);
        } catch (error) {
          console.error('Failed to delete items:', error);
          message.error('Failed to delete some items. Please try again.');
        } finally {
          setDeletingItems(false);
        }
      }
    });
  };

  const selectedItemsData = items.filter(item => selectedItems.includes(item.cartItemId));
  const selectedTotal = selectedItemsData.reduce((sum, item) => {
    const displayPrice = item.effectivePrice || item.price;
    return sum + (displayPrice * item.quantity);
  }, 0);

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
        onDeleteSelected={handleDeleteSelected}
        deletingItems={deletingItems}
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
