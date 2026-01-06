"use client";

import React, { useEffect, useRef } from "react";
import { ChatService } from "@/services/ChatService";
import { useSession } from "next-auth/react";

/**
 * Component để lưu thông tin user vào Firebase khi đăng nhập
 * Đặt component này trong layout để tự động cập nhật user info
 */
const ChatUserSync: React.FC = () => {
  const { data: session } = useSession();
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    const syncUserInfo = async () => {
      if (session?.user?.id) {
        // Chỉ sync nếu userId thay đổi hoặc chưa được sync
        if (lastSyncedUserId.current === session.user.id) {
          return;
        }

        try {
          await ChatService.saveUserInfo({
            id: session.user.id,
            name: session.user.name || "Unknown User",
            avatar: session.user.image || undefined,
            email: session.user.email || undefined,
          });
          lastSyncedUserId.current = session.user.id;
        } catch (error) {
          console.error("Error syncing user info:", error);
        }
      }
    };

    syncUserInfo();
  }, [session?.user?.id]);

  return null;
};

export default ChatUserSync;
