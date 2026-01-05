"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import wishlistService, { WishlistItemDto } from "@/services/WishlistService";
import { App } from "antd";
import { getCloudinaryUrl } from "@/config/config";
import {
  HeartFilled,
  HeartOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  InboxOutlined,
} from "@ant-design/icons";

export default function WishlistPage() {
  const router = useRouter();
  const { status } = useAuth();
  const { message, modal } = App.useApp();

  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setItems(data);
    } catch (error: any) {
      // Silently fail - no error display
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string, productName: string) => {
    modal.confirm({
      title: "Remove from Wishlist",
      content: `Are you sure you want to remove "${productName}" from your wishlist?`,
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await wishlistService.removeFromWishlist(productId);
          message.success("Removed from wishlist");
          fetchWishlist();
        } catch (error: any) {
          message.error(error.response?.data?.message || "Failed to remove item");
        }
      },
    });
  };

  const handleClearAll = () => {
    modal.confirm({
      title: "Clear Wishlist",
      content: "Are you sure you want to remove all items from your wishlist?",
      okText: "Clear All",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await wishlistService.clearWishlist();
          message.success("Wishlist cleared");
          setItems([]);
        } catch (error: any) {
          message.error(error.response?.data?.message || "Failed to clear wishlist");
        }
      },
    });
  };

  const handleEditNote = (wishlistId: string, currentNote: string | null) => {
    setEditingNote(wishlistId);
    setNoteValue(currentNote || "");
  };

  const handleSaveNote = async (productId: string) => {
    try {
      await wishlistService.updateNote(productId, noteValue);
      message.success("Note updated");
      setEditingNote(null);
      fetchWishlist();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update note");
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteValue("");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <span className="text-gray-600">Loading wishlist...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <HeartFilled className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold
                       hover:bg-red-100 transition-all border border-red-200"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <InboxOutlined className="text-5xl text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven&apos;t added any products to your wishlist yet.
                Start exploring and save your favorites!
              </p>
              <button
                onClick={() => router.push("/products")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white
                         rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700
                         transition-all shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.wishlistId}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-4
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Product Image */}
                <div
                  className="relative h-48 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl mb-4 overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/product/${item.product.id}`)}
                >
                  {item.product.images?.[0] && (
                    <Image
                      src={getCloudinaryUrl(item.product.images[0])}
                      alt={item.product.name}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}

                  {/* Remove Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.product.id, item.product.name);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 bg-white/90 backdrop-blur-sm
                             rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-all hover:bg-red-50 hover:scale-110"
                  >
                    <DeleteOutlined className="text-red-500 text-lg" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <h3
                    className="text-sm font-semibold line-clamp-2 text-gray-800 cursor-pointer
                             group-hover:text-blue-600 transition-colors"
                    onClick={() => router.push(`/product/${item.product.id}`)}
                  >
                    {item.product.name}
                  </h3>

                  {item.product.brand && (
                    <p className="text-xs text-gray-500 font-medium">
                      Brand: {item.product.brand}
                    </p>
                  )}

                  {item.product.shopName && (
                    <p className="text-xs text-gray-500">
                      Shop: {item.product.shopName}
                    </p>
                  )}

                  {/* Note Section */}
                  <div className="pt-2 border-t border-gray-100">
                    {editingNote === item.wishlistId ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveNote(item.product.id)}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg
                                     hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <SaveOutlined />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg
                                     hover:bg-gray-200 transition-colors"
                          >
                            <CloseOutlined />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        {item.note ? (
                          <p className="text-xs text-gray-600 italic flex-1 line-clamp-2">
                            📝 {item.note}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 flex-1">No note</p>
                        )}
                        <button
                          onClick={() => handleEditNote(item.wishlistId, item.note)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <EditOutlined className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => router.push(`/product/${item.product.id}`)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600
                               text-white text-sm rounded-lg font-semibold
                               hover:from-blue-700 hover:to-purple-700 transition-all
                               flex items-center justify-center gap-2"
                    >
                      <ShoppingCartOutlined />
                      View
                    </button>
                    <button
                      onClick={() => handleRemove(item.product.id, item.product.name)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg font-semibold
                               hover:bg-red-100 transition-all border border-red-200"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>

                  {/* Added Date */}
                  <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
