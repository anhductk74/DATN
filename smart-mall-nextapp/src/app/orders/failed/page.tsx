"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Result, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-red-500" />}
          title="Payment Failed!"
          subTitle="An error occurred during the payment process. Please try again or choose a different method."
          extra={[
            <Button
              key="retry"
              type="primary"
              size="large"
              className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              onClick={() => router.push("/checkout")}
            >
              Try Again
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
