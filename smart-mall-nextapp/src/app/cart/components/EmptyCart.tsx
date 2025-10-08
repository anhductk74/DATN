"use client";

import React from "react";
import { Empty, Button } from "antd";
import { useRouter } from "next/navigation";

export default function EmptyCart() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg p-12 text-center">
      <Empty description={"Your cart is empty"} />
      <Button type="primary" className="mt-4" onClick={() => router.push('/products')}>
        Continue Shopping
      </Button>
    </div>
  );
}