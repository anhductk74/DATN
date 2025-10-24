import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Message, ChatRoom, UserInfo } from "@/types/chat";

export class ChatService {
  // Tạo hoặc lấy chat room giữa 2 users
  static async getChatRoomId(userId1: string, userId2: string): Promise<string> {
    try {
      console.log('Getting chat room ID for users:', { userId1, userId2 });
      
      const roomId = [userId1, userId2].sort().join("_");
      const roomRef = doc(db, "chatRooms", roomId);
      
      const snapshot = await getDoc(roomRef);
      if (!snapshot.exists()) {
        console.log('Creating new chat room:', roomId);
        // Tạo room mới
        await setDoc(roomRef, {
          participants: [userId1, userId2],
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        console.log('Chat room already exists:', roomId);
      }
      
      return roomId;
    } catch (error) {
      console.error('Error in getChatRoomId:', error);
      throw error;
    }
  }

  // Gửi tin nhắn
  static async sendMessage(
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<void> {
    const roomId = await this.getChatRoomId(senderId, receiverId);
    const messagesRef = collection(db, "chatRooms", roomId, "messages");

    const message = {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    };

    const docRef = await addDoc(messagesRef, message);

    // Cập nhật lastMessage trong chatRoom
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      lastMessage: {
        ...message,
        id: docRef.id,
        timestamp: Timestamp.now(),
      },
      lastMessageTime: serverTimestamp(),
    });
  }

  // Lắng nghe tin nhắn realtime
  static listenToMessages(
    userId1: string,
    userId2: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const roomId = [userId1, userId2].sort().join("_");
    const messagesRef = collection(db, "chatRooms", roomId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          timestamp: data.timestamp?.toMillis() || Date.now(),
          read: data.read || false,
        });
      });
      callback(messages);
    });

    return unsubscribe;
  }

  // Lấy danh sách chat rooms của user
  static listenToChatRooms(
    userId: string,
    callback: (rooms: ChatRoom[]) => void
  ): () => void {
    const roomsRef = collection(db, "chatRooms");
    const q = query(roomsRef, where("participants", "array-contains", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rooms.push({
          id: doc.id,
          participants: data.participants || [],
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toMillis() || 0,
        });
      });
      // Sắp xếp theo thời gian tin nhắn cuối
      rooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      callback(rooms);
    });

    return unsubscribe;
  }

  // Đánh dấu tin nhắn đã đọc
  static async markMessagesAsRead(
    userId1: string,
    userId2: string,
    currentUserId: string
  ): Promise<void> {
    const roomId = [userId1, userId2].sort().join("_");
    const messagesRef = collection(db, "chatRooms", roomId, "messages");
    const q = query(
      messagesRef,
      where("receiverId", "==", currentUserId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map((document) =>
      updateDoc(doc(db, "chatRooms", roomId, "messages", document.id), {
        read: true,
      })
    );

    await Promise.all(updatePromises);
  }

  // Lấy số tin nhắn chưa đọc
  static async getUnreadCount(
    userId1: string,
    userId2: string,
    currentUserId: string
  ): Promise<number> {
    const roomId = [userId1, userId2].sort().join("_");
    const messagesRef = collection(db, "chatRooms", roomId, "messages");
    const q = query(
      messagesRef,
      where("receiverId", "==", currentUserId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Lưu thông tin user
  static async saveUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      console.log('Saving user info:', userInfo);
      const userRef = doc(db, "users", userInfo.id);
      await setDoc(userRef, {
        name: userInfo.name,
        avatar: userInfo.avatar || "",
        email: userInfo.email || "",
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log('User info saved successfully');
    } catch (error) {
      console.error('Error saving user info:', error);
      throw error;
    }
  }

  // Lấy thông tin user
  static async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      console.log('Getting user info for:', userId);
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const userInfo: UserInfo = {
          id: userId,
          name: data.name || "",
          avatar: data.avatar || "",
          email: data.email || "",
        };
        console.log('User info retrieved:', userInfo);
        return userInfo;
      }

      console.log('User info not found for:', userId);
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Kiểm tra xem chat room có tin nhắn nào chưa
  static async hasMessages(userId1: string, userId2: string): Promise<boolean> {
    try {
      const roomId = [userId1, userId2].sort().join("_");
      const messagesRef = collection(db, "chatRooms", roomId, "messages");
      const snapshot = await getDocs(messagesRef);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking messages:', error);
      return false;
    }
  }

  // Gửi tin nhắn chào tự động từ shop
  static async sendWelcomeMessage(
    shopOwnerId: string,
    customerId: string,
    welcomeText: string = "Hello, Can I Help You"
  ): Promise<void> {
    try {
      console.log('Sending welcome message from shop:', { shopOwnerId, customerId });
      
      // Kiểm tra xem đã có tin nhắn nào chưa
      const hasExistingMessages = await this.hasMessages(shopOwnerId, customerId);
      
      if (!hasExistingMessages) {
        // Gửi tin nhắn chào KHÔNG CHỜ (fire and forget)
        this.sendMessage(shopOwnerId, customerId, welcomeText)
          .then(() => console.log('Welcome message sent successfully'))
          .catch(err => console.error('Error sending welcome message:', err));
        console.log('Welcome message queued');
      } else {
        console.log('Chat room already has messages, skipping welcome message');
      }
    } catch (error) {
      console.error('Error in sendWelcomeMessage:', error);
      // Không throw error để không block việc mở chat
    }
  }
}
