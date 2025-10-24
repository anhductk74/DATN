"use client";

import React from "react";
import { Button, App } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { startChatWith } from "@/lib/chatUtils";
import { useSession } from "next-auth/react";
import { UserInfo } from "@/types/chat";

interface StartChatButtonProps {
  targetUserId: string;
  targetUserInfo?: Partial<UserInfo>;
  type?: "default" | "primary" | "text" | "link" | "dashed";
  size?: "small" | "middle" | "large";
  block?: boolean;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onChatStarted?: () => void;
  isShopOwner?: boolean; // Có phải chat với shop owner không (để gửi tin nhắn chào)
}

/**
 * Component button để bắt đầu chat với một user
 * Sử dụng trong các trang như Shop, Product, Order để chat với seller
 */
const StartChatButton: React.FC<StartChatButtonProps> = ({
  targetUserId,
  targetUserInfo,
  type = "default",
  size = "middle",
  block = false,
  children,
  className,
  icon,
  onChatStarted,
  isShopOwner = true,
}) => {
  const { data: session } = useSession();
  const { message } = App.useApp();
  const [loading, setLoading] = React.useState(false);
  const isProcessingRef = React.useRef(false); // Prevent double click

  const handleStartChat = async () => {
    // Prevent double click
    if (isProcessingRef.current) {
      console.log('Already processing, ignoring click');
      return;
    }

    if (!session?.user?.id) {
      message.warning("Vui lòng đăng nhập để chat");
      return;
    }

    if (session.user.id === targetUserId) {
      message.info("Bạn không thể chat với chính mình");
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    try {
      console.log('=== START CHAT BUTTON CLICKED ===');
      console.log('Current user:', session.user.id);
      console.log('Target user:', targetUserId);
      console.log('Target info:', targetUserInfo);
      
      // MỞ CHAT WIDGET NGAY LẬP TỨC (không đợi Firebase)
      console.log('Dispatching openChat event immediately');
      window.dispatchEvent(
        new CustomEvent("openChat", {
          detail: { userId: targetUserId },
        })
      );
      
      // Chạy startChatWith trong background (không chờ)
      startChatWith(
        session.user.id,
        targetUserId,
        targetUserInfo,
        isShopOwner
      ).then(result => {
        console.log('startChatWith completed:', result);
        if (!result.success) {
          console.error('Failed to initialize chat:', result.error);
        }
      }).catch(error => {
        console.error("Error in startChatWith:", error);
      }).finally(() => {
        // Reset processing flag sau khi hoàn thành
        isProcessingRef.current = false;
      });
      
      message.success("Đã mở chat");
      onChatStarted?.();
      
    } catch (error) {
      console.error("Error starting chat:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại");
      isProcessingRef.current = false;
    } finally {
      // Tắt loading ngay sau khi dispatch event
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <Button
      type={type}
      size={size}
      block={block}
      icon={icon || <MessageOutlined />}
      onClick={handleStartChat}
      loading={loading}
      className={className}
    >
      {children || "Chat ngay"}
    </Button>
  );
};

export default StartChatButton;
