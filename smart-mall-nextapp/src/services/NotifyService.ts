import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const notifyCollection = collection(db, "notifications");
type NotificationType = "ORDER" | "PROMOTION" | "SYSTEM";

export const createNotification = async (
    receiverId: string,
    senderId: string,   
    message: string,
    type: NotificationType
) => {
  try {
    await addDoc(notifyCollection, {
      receiverId: receiverId,     // landlord sẽ nhận
      senderId: senderId,         // user tạo booking
      type: type,
      message: message,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};
