"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAntdApp } from "@/hooks/useAntdApp";
import cartService, { type Cart as ApiCart, type CartItem as ApiCartItem } from "@/services/CartService";
import productService from "@/services/ProductService";

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
  // Flash sale fields
  isFlashSaleActive?: boolean;
  effectivePrice?: number;
  flashSalePrice?: number;
  discountPercent?: number;
  flashSaleQuantity?: number;
  flashSaleStart?: string;
  flashSaleEnd?: string;
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
 * Transform API cart item to local format with real shop data
 */
async function transformApiCartToLocal(apiCart: ApiCart): Promise<CartItem[]> {
  // Create a map to cache product data and avoid duplicate API calls
  const productCache = new Map<string, any>();
  
  // Process all cart items in parallel
  const transformPromises = apiCart.items.map(async (item: ApiCartItem) => {
    try {
      // Try to get shop info from cart API first
      let shopId = item.productShopId;
      let shopName = item.productShopName;
      let shopAvatar: string | undefined;
      
      // If shop info not available in cart, fetch from product API
      if (!shopId || !shopName) {
        // We need to find the product that contains this variant
        // Since we don't have productId directly, we'll use a search approach
        try {
          // Search for products by name to find the one containing this variant
          const searchResults = await productService.searchProductsByName(item.productName);
          
          // Find the product that contains our variant
          const product = searchResults.find(p => 
            p.variants?.some(v => v.id === item.variant.id)
          );
          
          if (product?.shop) {
            shopId = product.shop.id;
            shopName = product.shop.name;
            shopAvatar = product.shop.avatar;
            
            console.log('Found real shop data from product API:', {
              productName: item.productName,
              shopId,
              shopName,
              shopAvatar
            });
          }
        } catch (error) {
          console.warn('Failed to fetch product data for cart item:', error);
        }
      }
      
      // Fallback to mock data if still no shop info
      if (!shopId || !shopName) {
        shopId = `shop-${item.variant.productBrand.toLowerCase().replace(/\s+/g, '-')}`;
        shopName = `${item.variant.productBrand} Official Store`;
        
        console.log('Using fallback shop data:', {
          productName: item.productName,
          fallbackShopId: shopId,
          fallbackShopName: shopName
        });
      }
      
      console.log('Final cart item transformation:', {
        productName: item.productName,
        brand: item.variant.productBrand,
        finalShopId: shopId,
        finalShopName: shopName,
        hasRealShopData: !shopId.startsWith('shop-')
      });
      
      return {
        id: item.variant.id,
        cartItemId: item.id,
        variantId: item.variant.id,
        title: item.productName,
        price: item.variant.price,
        image: item.productImage,
        quantity: item.quantity,
        shopName: shopName,
        shopId: shopId,
        brand: item.variant.productBrand,
        variant: item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', '),
        // Flash sale fields from variant
        isFlashSaleActive: item.variant.isFlashSaleActive,
        effectivePrice: item.variant.effectivePrice,
        flashSalePrice: item.variant.flashSalePrice,
        discountPercent: item.variant.discountPercent,
        flashSaleQuantity: item.variant.flashSaleQuantity,
        flashSaleStart: item.variant.flashSaleStart,
        flashSaleEnd: item.variant.flashSaleEnd,
      };
    } catch (error) {
      console.error('Error transforming cart item:', error);
      
      // Fallback transformation
      const fallbackShopId = `shop-${item.variant.productBrand.toLowerCase().replace(/\s+/g, '-')}`;
      const fallbackShopName = `${item.variant.productBrand} Official Store`;
      
      return {
        id: item.variant.id,
        cartItemId: item.id,
        variantId: item.variant.id,
        title: item.productName,
        price: item.variant.price,
        image: item.productImage,
        quantity: item.quantity,
        shopName: fallbackShopName,
        shopId: fallbackShopId,
        brand: item.variant.productBrand,
        variant: item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', '),
        // Flash sale fields from variant
        isFlashSaleActive: item.variant.isFlashSaleActive,
        effectivePrice: item.variant.effectivePrice,
        flashSalePrice: item.variant.flashSalePrice,
        discountPercent: item.variant.discountPercent,
        flashSaleQuantity: item.variant.flashSaleQuantity,
        flashSaleStart: item.variant.flashSaleStart,
        flashSaleEnd: item.variant.flashSaleEnd,
      };
    }
  });
  
  // Wait for all transformations to complete
  const transformedItems = await Promise.all(transformPromises);
  return transformedItems;
}

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const { message } = useAntdApp();

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
      const transformedItems = await transformApiCartToLocal(apiCart);
      setItems(transformedItems);
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
      const transformedItems = await transformApiCartToLocal(apiCart);
      setItems(transformedItems);

      

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
      const transformedItems = await transformApiCartToLocal(apiCart);
      setItems(transformedItems);
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
  const totalPrice = useMemo(() => items.reduce((s, it) => {
    const displayPrice = it.effectivePrice || it.price;
    return s + it.quantity * displayPrice;
  }, 0), [items]);

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
