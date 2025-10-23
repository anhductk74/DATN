"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AddProductForm from "../components/AddProductForm";
import type { CreateProductData } from "@/services/productService";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (productData: CreateProductData, images: File[]) => {
    setIsSubmitting(true);
    try {
      console.log('Creating product:', productData, images);
      // Here you would call the productService.createProduct(productData, images)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Product created successfully!');
      router.push('/shop/products/all');
    } catch (error) {
      console.error('Error creating product:', error);
      message.error('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/shop/products/all');
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