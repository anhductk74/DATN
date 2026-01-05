import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import wishlistService, { WishlistItemDto } from '@/services/WishlistService';

interface UseWishlistReturn {
  items: WishlistItemDto[];
  count: number;
  loading: boolean;
  addToWishlist: (productId: string, note?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkInWishlist: (productId: string) => Promise<boolean>;
  updateNote: (productId: string, note: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

export const useWishlist = (): UseWishlistReturn => {
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const refreshWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const [wishlistItems, wishlistCount] = await Promise.all([
        wishlistService.getWishlist(),
        wishlistService.getWishlistCount()
      ]);
      console.log('🔄 Wishlist refreshed:', { itemsCount: wishlistItems.length, countFromAPI: wishlistCount });
      setItems(wishlistItems);
      setCount(wishlistCount);
    } catch (error) {
      console.error('❌ Error refreshing wishlist:', error);
      // Silently fail - no error display needed
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔑 Session status:', status, 'Session:', session ? 'exists' : 'null');
    if (status === 'authenticated' && session) {
      console.log('📥 Loading wishlist...');
      refreshWishlist();
    } else {
      console.log('⚠️ Not authenticated, skipping wishlist load');
    }
  }, [status, session, refreshWishlist]);

  const addToWishlist = async (productId: string, note?: string) => {
    try {
      await wishlistService.addToWishlist(productId, note);
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  const clearWishlist = async () => {
    try {
      await wishlistService.clearWishlist();
      setItems([]);
      setCount(0);
    } catch (error) {
      throw error;
    }
  };

  const checkInWishlist = async (productId: string) => {
    try {
      return await wishlistService.checkInWishlist(productId);
    } catch (error) {
      // Silently fail - return false if not authenticated or error
      return false;
    }
  };

  const updateNote = async (productId: string, note: string) => {
    try {
      await wishlistService.updateNote(productId, note);
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  return {
    items,
    count,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkInWishlist,
    updateNote,
    refreshWishlist
  };
};
