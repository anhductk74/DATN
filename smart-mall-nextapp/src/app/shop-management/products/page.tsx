"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShopProductsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to all products by default
    router.replace('/shop/products/all');
  }, [router]);

  return null;
}
