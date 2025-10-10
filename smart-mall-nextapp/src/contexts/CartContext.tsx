"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useSession } from "next-auth/react";
import cartService, { type Cart as ApiCart, type CartItem as ApiCartItem } from "@/services/cartService";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  shopName?: string;
  shopId?: string;
  brand?: string;
  variant?: string;
  sale?: string;
  variantId: string;
  cartItemId: string;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  loading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Transform API cart item to local format
 */
function transformApiCartToLocal(apiCart: ApiCart): CartItem[] {
  // Mock shop mapping based on brand - in production, this should come from API
  const getShopInfo = (brand: string) => {
    const shopMappings: { [key: string]: { name: string, id: string } } = {
      'Apple': { name: 'Apple Official Store', id: 'shop-apple' },
      'Samsung': { name: 'Samsung Galaxy Store', id: 'shop-samsung' },
      'Sony': { name: 'Sony Electronics', id: 'shop-sony' },
      'Nike': { name: 'Nike Official', id: 'shop-nike' },
      'Adidas': { name: 'Adidas Store', id: 'shop-adidas' },
      'Dell': { name: 'Dell Computer Store', id: 'shop-dell' },
      'HP': { name: 'HP Official Store', id: 'shop-hp' },
      // Add more brands as needed
    };
    
    return shopMappings[brand] || { 
      name: `${brand} Official Store`,
      id: `shop-${brand.toLowerCase().replace(/\s+/g, '-')}`
    };
  };

  return apiCart.items.map((item: ApiCartItem) => {
    const brand = item.variant.productBrand;
    const shopInfo = getShopInfo(brand);
    
    return {
      id: item.variant.id,
      cartItemId: item.id,
      variantId: item.variant.id,
      title: item.productName,
      price: item.variant.price,
      image: item.productImage,
      quantity: item.quantity,
      shopName: shopInfo.name,
      shopId: shopInfo.id,
      brand: brand,
      variant: item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', '),
    };
  });
}

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  // Load cart when user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      refreshCart();
    } else if (status === 'unauthenticated') {
      setItems([]);
    }
  }, [status]);

  const refreshCart = async () => {
    if (status !== 'authenticated') return;
    
    try {
      setLoading(true);
      const apiCart = await cartService.getCart();
      setItems(transformApiCartToLocal(apiCart));
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      // Don't show error message on initial load, cart might be empty
      if (error?.response?.status !== 404) {
        message.error('Không thể tải giỏ hàng');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (variantId: string, quantity: number = 1) => {
    if (status !== 'authenticated') {
      message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      setLoading(true);
      const apiCart = await cartService.addItem({ variantId, quantity });
      setItems(transformApiCartToLocal(apiCart));
      message.success('Đã thêm vào giỏ hàng');
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      message.error(error?.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (status !== 'authenticated') return;

    try {
      setLoading(true);
      await cartService.removeItem(cartItemId);
      setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
      message.success('Đã xóa khỏi giỏ hàng');
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      message.error(error?.response?.data?.message || 'Không thể xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (status !== 'authenticated') return;
    if (quantity < 1) {
      await removeItem(cartItemId);
      return;
    }

    // Optimistic update - update UI immediately
    const previousItems = [...items];
    setItems(prev => 
      prev.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity } 
          : item
      )
    );

    try {
      const apiCart = await cartService.updateItem({ cartItemId, quantity });
      // Update with actual data from server
      setItems(transformApiCartToLocal(apiCart));
    } catch (error: any) {
      console.error('Failed to update cart item:', error);
      message.error(error?.response?.data?.message || 'Không thể cập nhật số lượng');
      // Rollback to previous state on error
      setItems(previousItems);
    }
  };

  const clearCart = async () => {
    if (status !== 'authenticated') return;

    try {
      setLoading(true);
      await cartService.clearCart();
      setItems([]);
      message.success('Đã xóa tất cả sản phẩm');
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      message.error(error?.response?.data?.message || 'Không thể xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const totalCount = useMemo(() => items.reduce((s, it) => s + it.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, it) => s + it.quantity * it.price, 0), [items]);

  const value: CartContextValue = {
    items,
    totalCount,
    totalPrice,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartContext;
