"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Result } from "antd";
import { CheckCircleOutlined, ShoppingOutlined } from "@ant-design/icons";

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <Result
          icon={<CheckCircleOutlined className="text-green-500" />}
          title="Order Placed Successfully!"
          subTitle="Thank you for your purchase. Your order has been confirmed and will be processed soon."
          extra={[
            <Button 
              key="continue" 
              type="primary" 
              size="large"
              className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              onClick={() => router.push('/products')}
            >
              Continue Shopping
            </Button>,
            <Button 
              key="home" 
              size="large"
              onClick={() => router.push('/home')}
            >
              Back to Home
            </Button>
          ]}
        />
      </div>
    </div>
  );
}