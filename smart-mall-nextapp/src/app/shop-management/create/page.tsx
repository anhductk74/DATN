"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { shopService, CreateShopData, Shop } from "@/services";
import CreateShopBasic from "../components/CreateShopBasic";
import EmptyShopState from "../components/EmptyShopState";
import { LoadingOutlined } from "@ant-design/icons";

export default function CreateShopPage() {
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasShop, setHasShop] = useState(false);

  // Check if user already has a shop
  useEffect(() => {
    const checkExistingShop = async () => {
      if (!userProfile?.id) {
        setChecking(false);
        return;
      }

      try {
        const response = await shopService.getShopsByOwner(userProfile.id);
        if (response.data && response.data.length > 0) {
          // User already has a shop, redirect to management
          setHasShop(true);
          router.replace('/shop-management');
        } else {
          setHasShop(false);
        }
      } catch (error) {
        console.error('Failed to check shop:', error);
        setHasShop(false);
      } finally {
        setChecking(false);
      }
    };

    checkExistingShop();
  }, [userProfile?.id, router]);

  const handleCreateShop = async (data: CreateShopData | any, imageFile?: File) => {
    if (!userProfile?.id) {
      message.error('User not authenticated');
      return;
    }

    setSubmitting(true);
    try {
      const shopData: CreateShopData = {
        name: data.name,
        description: data.description,
        phoneNumber: data.phoneNumber,
        cccd: data.cccd,
        address: data.address,
        ownerId: userProfile.id,
      };

      const response = await shopService.createShop(shopData, imageFile);
      
      if (response.data) {
        message.success('Shop created successfully!');
        // Redirect to shop management using replace to prevent back navigation
        router.replace('/shop-management');
      } else {
        message.error('Failed to create shop');
      }
    } catch (error: any) {
      console.error('Failed to create shop:', error);
      message.error(error?.response?.data?.message || 'Failed to create shop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      router.push('/home');
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingOutlined className="text-5xl text-blue-500 mb-4" />
          <p className="text-gray-600">Checking shop status...</p>
        </div>
      </div>
    );
  }

  // If user has shop, don't render anything (will redirect)
  if (hasShop) {
    return null;
  }

  // Show form if user clicked create button
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <CreateShopBasic
            onSubmit={handleCreateShop}
            onCancel={handleCancel}
            submitting={submitting}
          />
        </div>
      </div>
    );
  }

  // Show empty state (welcome page) by default
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <EmptyShopState onCreateShop={() => setShowForm(true)} />
    </div>
  );
}
