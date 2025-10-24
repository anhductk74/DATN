import { ChatService } from "@/services/ChatService";
import { UserInfo } from "@/types/chat";

/**
 * Utility functions for chat features
 */

/**
 * Bắt đầu chat với một user
 * @param currentUserId - ID của user hiện tại
 * @param targetUserId - ID của user muốn chat (shop owner)
 * @param targetUserInfo - Thông tin của user muốn chat
 * @param isShopOwner - Có phải chat với shop owner không (để gửi tin nhắn chào)
 */
export async function startChatWith(
  currentUserId: string,
  targetUserId: string,
  targetUserInfo?: Partial<UserInfo>,
  isShopOwner: boolean = true
) {
  try {
    console.log('startChatWith called:', { currentUserId, targetUserId, isShopOwner });
    
    // Lưu thông tin user nếu có (không chờ để tránh block)
    if (targetUserInfo && targetUserInfo.name) {
      ChatService.saveUserInfo({
        id: targetUserId,
        name: targetUserInfo.name,
        avatar: targetUserInfo.avatar,
        email: targetUserInfo.email,
      }).catch(err => console.error('Error saving user info:', err));
    }

    // Tạo hoặc lấy chat room - CHỈ CHỜ VIỆC NÀY
    const roomId = await Promise.race<string>([
      ChatService.getChatRoomId(currentUserId, targetUserId),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout getting chat room')), 5000)
      )
    ]);
    
    console.log('Chat room ID obtained:', roomId);
    
    // Nếu là shop owner, gửi tin nhắn chào tự động (KHÔNG CHỜ)
    if (isShopOwner) {
      ChatService.sendWelcomeMessage(targetUserId, currentUserId)
        .catch(err => console.error('Error sending welcome message:', err));
    }
    
    return { success: true, roomId };
  } catch (error) {
    console.error("Error starting chat:", error);
    return { success: false, error };
  }
}

/**
 * Format thời gian hiển thị trong chat
 */
export function formatChatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format thời gian tin nhắn trong bubble
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate text với số ký tự tối đa
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Check xem có phải tin nhắn mới không (trong vòng 5 phút)
 */
export function isRecentMessage(timestamp: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return now - timestamp < fiveMinutes;
}

/**
 * Get initials từ tên để hiển thị avatar
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate màu avatar dựa trên tên
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#1890ff",
    "#52c41a",
    "#eb2f96",
    "#722ed1",
  ];
  
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}
