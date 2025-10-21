"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Result, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <Result
          icon={<CheckCircleOutlined className="text-green-500" />}
          title="Payment Successful!"
          subTitle="Thank you for your order. Your order is being processed."
          extra={[
            <Button
              key="orders"
              type="primary"
              size="large"
              className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              onClick={() => router.push("/orders")}
            >
              View My Orders
            </Button>,
            <Button key="home" size="large" onClick={() => router.push("/home")}>
              Back to Home
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}