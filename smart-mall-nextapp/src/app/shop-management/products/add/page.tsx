"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AddProductForm from "../components/AddProductForm";
import type { CreateProductData } from "@/services/ProductService";
import productService from "@/services/ProductService";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (productData: CreateProductData, images: File[]) => {
    setIsSubmitting(true);
    try {
      await productService.createProduct(productData, images);
      message.success('Product created successfully!');
      router.push('/shop-management/products/all');
    } catch (error: any) {
      console.error('Error creating product:', error);
      message.error(error.response?.data?.message || 'Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/shop-management/products/all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {/* Add Product Form */}
      <AddProductForm
        visible={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isSubmitting}
        showAsModal={false}
      />
    </div>
  );
}