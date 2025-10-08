"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { useCart } from "@/contexts/CartContext";
import {
  CartHeader,
  CartTable,
  CartFooter,
  VoucherSection,
  VoucherModal,
  ShippingModal,
  EmptyCart,
  LoadingState
} from "./components";

// Mock data for testing
const mockCartItems = [
  {
    id: "1",
    title: "Polo Lacoste Crocodile Embroidered Cotton Premium Men's",
    price: 260000,
    originalPrice: 350000,
    image: "https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/aed3f011c1af682143df170bf8f6e96d.webp",
    quantity: 1,
    shopName: "PHENOM Fashion Guangzhou",
    variant: "Color: Black, Size: S (<1m70, 45-60kg)",
    sale: "10.10"
  },
  {
    id: "2", 
    title: "Basic Polo Horse Embroidered Premium Cotton",
    price: 244999,
    originalPrice: 299000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    quantity: 2,
    shopName: "Fashion Store Official",
    variant: "Color: Navy Blue, Size: M",
    sale: "FLASH"
  },
  {
    id: "3",
    title: "Men's Lace-up Dress Shoes Korean Style",
    price: 396000,
    originalPrice: 480000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop",
    quantity: 1,
    shopName: "Shoe World Vietnam",
    variant: "Size: 42, Color: Black",
    sale: "11.11"
  },
  {
    id: "4",
    title: "Men's Premium Wide Leg Jeans",
    price: 219000,  
    originalPrice: 289000,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
    quantity: 1,
    shopName: "Denim Plus Store",
    variant: "Size: 30, Color: Dark Blue"
  },
  {
    id: "5",
    title: "Premium Stussy Sport Logo Embroidered Bomber",
    price: 229000,
    originalPrice: 299000,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
    quantity: 1,
    shopName: "Street Fashion Hub",
    variant: "Size: L, Color: Black",
    sale: "HOT"
  }
];

export default function CartPage() {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart, addItem } = useCart();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [shippingInfoVisible, setShippingInfoVisible] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add mock data on component mount for demo
  useEffect(() => {
    if (mounted && items.length === 0) {
      setTimeout(() => {
        mockCartItems.forEach(item => addItem(item));
      }, 100);
    }
  }, [mounted, items.length, addItem]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(items.map(item => item.id));
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

  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const selectedTotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update selectAll when all items are selected individually
  useEffect(() => {
    if (items.length > 0 && selectedItems.length === items.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems.length, items.length]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <LoadingState />;
  }

  return (
    <>
      <CartHeader onLogoClick={() => router.push('/home')} />

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
