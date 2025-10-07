"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useAuth } from "@/contexts/AuthContext";
import { useAntdApp } from "@/hooks/useAntdApp";
import { shopService, type Shop, type CreateShopData, type UpdateShopData } from "@/services";
import { ShopForm, ShopCard, EmptyShopState, LoadingSpinner } from "@/app/shop/components";
import Link from "next/link";

export default function MyShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user, status } = useAuth();
  const { message } = useAntdApp();

  useEffect(() => {
    const loadUserShop = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const response = await shopService.getShopsByOwner(user.id);
        const userShops = response.data || [];
        // User can only have one shop
        setShop(userShops.length > 0 ? userShops[0] : null);
      } catch (error) {
        console.error("Load shop error:", error);
        message.error("Failed to load shop!");
      } finally {
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (user?.id) {
      loadUserShop();
    }
  }, [user, status, router, message]);

  const handleCreateShop = async (data: CreateShopData | UpdateShopData, imageFile?: File) => {
    if (!user?.id) {
      message.error("Please login to create shop!");
      return;
    }

    // Check if user already has a shop
    if (shop && !editingShop) {
      message.error("You already have a shop! Each user can only create one shop.");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      
      if (editingShop) {
        // Update existing shop
        response = await shopService.updateShop(editingShop.id, data as UpdateShopData, imageFile);
      } else {
        // Create new shop
        const shopData: CreateShopData = {
          ...data as CreateShopData,
          ownerId: user.id,
        };
        response = await shopService.createShop(shopData, imageFile);
      }

      if (response.status === 200) {
        message.success(editingShop ? "Shop updated successfully!" : "Shop created successfully!");
        setShop(response.data);
        setShowCreateForm(false);
        setEditingShop(null);
      } else {
        message.error(response.message || `Failed to ${editingShop ? 'update' : 'create'} shop!`);
      }
    } catch (error) {
      console.error(`${editingShop ? 'Update' : 'Create'} shop error:`, error);
      message.error(`Failed to ${editingShop ? 'update' : 'create'} shop!`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditShop = (shopToEdit: Shop) => {
    setEditingShop(shopToEdit);
    setShowCreateForm(true);
  };

  const handleDeleteShop = async (shopToDelete: Shop) => {
    if (!window.confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await shopService.deleteShop(shopToDelete.id);
      
      if (response.status === 200) {
        message.success("Shop deleted successfully!");
        setShop(null);
      } else {
        message.error(response.message || "Failed to delete shop!");
      }
    } catch (error) {
      console.error("Delete shop error:", error);
      message.error("Failed to delete shop!");
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingShop(null);
  };



  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <LoadingSpinner message="Authenticating..." size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      {/* Enhanced Breadcrumb */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/shop">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
            </Link>
            <span className="mx-3 text-gray-400">/</span>
            <Link href="/shop">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">My Shop</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Form Section */}
        {showCreateForm && (
          <div className="mb-12">
            <ShopForm
              shop={editingShop}
              onSubmit={handleCreateShop}
              onCancel={handleCancelForm}
              submitting={submitting}
            />
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <LoadingSpinner message="Loading your shop..." size="large" />
        ) : !shop ? (
          <EmptyShopState onCreateShop={() => setShowCreateForm(true)} />
        ) : (
          <ShopCard
            shop={shop}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}