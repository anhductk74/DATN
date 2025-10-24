import { useState, useEffect, useCallback } from "react";
import { ChatService } from "@/services/ChatService";
import { Message, ChatRoom, ChatUser } from "@/types/chat";
import { useSession } from "next-auth/react";

/**
 * Hook để quản lý chat
 */
export function useChat() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = session?.user?.id || "";

  // Lắng nghe chat rooms
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    const unsubscribe = ChatService.listenToChatRooms(
      currentUserId,
      (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (receiverId: string, text: string) => {
      if (!currentUserId || !text.trim()) return;

      try {
        await ChatService.sendMessage(currentUserId, receiverId, text.trim());
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi gửi tin nhắn";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [currentUserId]
  );

  // Đánh dấu đã đọc
  const markAsRead = useCallback(
    async (otherUserId: string) => {
      if (!currentUserId) return;

      try {
        await ChatService.markMessagesAsRead(
          currentUserId,
          otherUserId,
          currentUserId
        );
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    },
    [currentUserId]
  );

  // Lấy số tin nhắn chưa đọc
  const getUnreadCount = useCallback(
    async (otherUserId: string) => {
      if (!currentUserId) return 0;

      try {
        return await ChatService.getUnreadCount(
          currentUserId,
          otherUserId,
          currentUserId
        );
      } catch (err) {
        console.error("Error getting unread count:", err);
        return 0;
      }
    },
    [currentUserId]
  );

  return {
    chatRooms,
    loading,
    error,
    currentUserId,
    sendMessage,
    markAsRead,
    getUnreadCount,
  };
}

/**
 * Hook để quản lý tin nhắn của một cuộc trò chuyện
 */
export function useChatMessages(otherUserId: string | null) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const currentUserId = session?.user?.id || "";

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    setLoading(true);
    const unsubscribe = ChatService.listenToMessages(
      currentUserId,
      otherUserId,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId, otherUserId]);

  return { messages, loading };
}

/**
 * Hook để lấy thông tin user
 */
export function useUserInfo(userId: string | null) {
  const [userInfo, setUserInfo] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const info = await ChatService.getUserInfo(userId);
        setUserInfo(info);
      } catch (err) {
        console.error("Error fetching user info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return { userInfo, loading };
}
