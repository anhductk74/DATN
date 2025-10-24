export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime: number;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface ChatUser extends UserInfo {
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
}
