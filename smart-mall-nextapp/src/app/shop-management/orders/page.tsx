"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderManagement() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to all-orders page immediately
    router.replace("/shop-management/orders/all-orders");
  }, [router]);

  // Return null or a simple loading state while redirecting
  return null;
}