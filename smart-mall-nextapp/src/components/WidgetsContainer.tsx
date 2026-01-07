"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), {
  ssr: false,
});

const Chatbot = dynamic(() => import("@/components/Chatbot"), {
  ssr: false,
});

const VirtualTryOnWidget = dynamic(() => import("@/components/VirtualTryOnWidget"), {
  ssr: false,
});

export default function WidgetsContainer() {
  const pathname = usePathname();
  
  // Ẩn widgets khi đang ở trang shop-management
  const isShopManagement = pathname?.startsWith("/shop-management");
  
  if (isShopManagement) {
    return null;
  }
  
  return (
    <>
      <ChatWidget />
      <Chatbot />
      <VirtualTryOnWidget />
    </>
  );
}
