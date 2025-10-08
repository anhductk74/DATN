"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  shopName?: string;
  variant?: string;
  sale?: string;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "sm_cart";

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw) as CartItem[]);
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, hydrated]);

  const addItem = (incoming: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === incoming.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += incoming.quantity ?? 1;
        return copy;
      }
      return [...prev, { ...incoming, quantity: incoming.quantity ?? 1 } as CartItem];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p)));
  };

  const clearCart = () => setItems([]);

  const totalCount = useMemo(() => items.reduce((s, it) => s + it.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, it) => s + it.quantity * it.price, 0), [items]);

  const value: CartContextValue = {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartContext;
