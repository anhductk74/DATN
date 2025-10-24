"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Badge, Avatar, Empty, Spin, Upload, Image, App as AntApp } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  UserOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { ChatService } from "@/services/ChatService";
import { ImageUploadService } from "@/services/ImageUploadService";
import { Message, ChatRoom, UserInfo, ChatUser } from "@/types/chat";
import { useSession } from "next-auth/react";
import { getCloudinaryUrl } from "@/config/config";

const ChatWidget: React.FC = () => {
  const { data: session } = useSession();
  const { message: messageApi } = AntApp.useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [userInfoCache, setUserInfoCache] = useState<Map<string, UserInfo>>(
    new Map()
  );
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = session?.user?.id || "";

  // Lắng nghe event mở chat từ bên ngoài
  useEffect(() => {
    const handleOpenChat = async (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string }>;
      const { userId } = customEvent.detail;
      
      console.log('=== CHAT WIDGET: RECEIVED openChat EVENT ===');
      console.log('Target userId:', userId);
      console.log('Current userId:', currentUserId);
      
      if (!userId) {
        console.error('No userId provided in event');
        return;
      }

      if (!currentUserId) {
        console.error('Current user not logged in');
        return;
      }

      try {
        // MỞ CHAT WIDGET NGAY LẬP TỨC
        console.log('Opening chat widget...');
        setIsOpen(true);
        
        // Lấy thông tin user (ưu tiên từ cache hoặc Firebase)
        console.log('Getting user info...');
        let userInfo: UserInfo | null | undefined = userInfoCache.get(userId);
        
        if (!userInfo) {
          userInfo = await Promise.race<UserInfo | null>([
            ChatService.getUserInfo(userId),
            new Promise<UserInfo | null>((resolve) => 
              setTimeout(() => {
                console.log('Timeout getting user info, using default');
                resolve({
                  id: userId,
                  name: 'Shop',
                  avatar: '',
                });
              }, 3000)
            )
          ]);
        }
        
        console.log('User info retrieved:', userInfo);
        
        if (userInfo) {
          setSelectedUser({
            ...userInfo,
            unreadCount: 0,
          });
          console.log('Selected user set successfully');
        }
        
      } catch (error) {
        console.error('Error opening chat:', error);
        // Vẫn mở chat widget dù có lỗi
        setIsOpen(true);
        setSelectedUser({
          id: userId,
          name: 'Shop',
          avatar: '',
          unreadCount: 0,
        });
      }
    };

    console.log('ChatWidget: Adding openChat event listener');
    window.addEventListener("openChat", handleOpenChat);
    
    return () => {
      console.log('ChatWidget: Removing openChat event listener');
      window.removeEventListener("openChat", handleOpenChat);
    };
  }, [currentUserId, userInfoCache]);

  // Lắng nghe chat rooms
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = ChatService.listenToChatRooms(
      currentUserId,
      (rooms) => {
        setChatRooms(rooms);
        loadUserInfoForRooms(rooms);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  // Tải thông tin users
  const loadUserInfoForRooms = async (rooms: ChatRoom[]) => {
    const newCache = new Map(userInfoCache);

    for (const room of rooms) {
      const otherUserId = room.participants.find((id) => id !== currentUserId);
      if (otherUserId && !newCache.has(otherUserId)) {
        const userInfo = await ChatService.getUserInfo(otherUserId);
        if (userInfo) {
          newCache.set(otherUserId, userInfo);
        }
      }
    }

    setUserInfoCache(newCache);
  };

  // Tính tổng số tin nhắn chưa đọc
  useEffect(() => {
    const calculateUnread = async () => {
      let total = 0;
      for (const room of chatRooms) {
        const otherUserId = room.participants.find(
          (id) => id !== currentUserId
        );
        if (otherUserId) {
          const unread = await ChatService.getUnreadCount(
            currentUserId,
            otherUserId,
            currentUserId
          );
          total += unread;
        }
      }
      setTotalUnread(total);
    };

    if (currentUserId && chatRooms.length > 0) {
      calculateUnread();
    }
  }, [chatRooms, currentUserId]);

  // Lắng nghe tin nhắn khi chọn user
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    setLoading(true);
    const unsubscribe = ChatService.listenToMessages(
      currentUserId,
      selectedUser.id,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      }
    );

    // Đánh dấu đã đọc
    ChatService.markMessagesAsRead(
      currentUserId,
      selectedUser.id,
      currentUserId
    );

    return () => unsubscribe();
  }, [selectedUser, currentUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    // Multiple layers of protection against duplicate sends
    if ((!messageText.trim() && fileList.length === 0) || !selectedUser || !currentUserId || sending) {
      console.log('Send blocked:', { 
        hasText: !!messageText.trim(),
        hasImages: fileList.length > 0,
        hasUser: !!selectedUser, 
        hasCurrentUser: !!currentUserId, 
        sending 
      });
      return;
    }

    const textToSend = messageText.trim();
    const filesToUpload = [...fileList];
    
    console.log('Sending message with:', { text: textToSend, imageCount: filesToUpload.length });
    
    try {
      setSending(true);
      setMessageText(""); // Clear input ngay
      setFileList([]); // Clear file list ngay
      
      // Upload images nếu có
      let imageUrls: string[] = [];
      if (filesToUpload.length > 0) {
        setUploading(true);
        try {
          const files: File[] = [];
          for (const f of filesToUpload) {
            if (f.originFileObj) {
              files.push(f.originFileObj as File);
            }
          }
          
          imageUrls = await ImageUploadService.uploadImages(files);
          console.log('Images uploaded:', imageUrls);
        } catch (error) {
          console.error('Error uploading images:', error);
          messageApi.error('Lỗi khi upload ảnh');
          // Restore nếu upload failed
          setMessageText(textToSend);
          setFileList(filesToUpload);
          return;
        } finally {
          setUploading(false);
        }
      }
      
      // Gửi tin nhắn
      await ChatService.sendMessage(
        currentUserId,
        selectedUser.id,
        textToSend,
        imageUrls.length > 0 ? imageUrls : undefined
      );
      console.log('Message sent successfully');
    } catch (error) {
      console.error("Error sending message:", error);
      messageApi.error('Lỗi khi gửi tin nhắn');
      // Restore message nếu gửi failed
      setMessageText(textToSend);
      setFileList(filesToUpload);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files)
      .map((file, index) => {
        // Validate file
        const validation = ImageUploadService.validateImage(file);
        if (!validation.valid) {
          messageApi.error(validation.error || 'File không hợp lệ');
          return null;
        }

        return {
          uid: `${Date.now()}-${index}`,
          name: file.name,
          status: 'done' as const,
          originFileObj: file,
          url: URL.createObjectURL(file),
        } as UploadFile;
      })
      .filter((f): f is UploadFile => f !== null);

    setFileList([...fileList, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (uid: string) => {
    setFileList(fileList.filter(f => f.uid !== uid));
  };

  const handleSelectUser = async (room: ChatRoom) => {
    const otherUserId = room.participants.find((id) => id !== currentUserId);
    if (!otherUserId) return;

    const userInfo = userInfoCache.get(otherUserId);
    if (!userInfo) return;

    const unreadCount = await ChatService.getUnreadCount(
      currentUserId,
      otherUserId,
      currentUserId
    );

    setSelectedUser({
      ...userInfo,
      lastMessage: room.lastMessage?.text,
      lastMessageTime: room.lastMessageTime,
      unreadCount,
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (!session) return null;

  return (
    <>
      {/* Chat Icon Button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
        }}
      >
        <Badge count={totalUnread} offset={[-5, 5]}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: "56px",
              height: "56px",
              fontSize: "24px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          />
        </Badge>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "96px",
            right: "24px",
            width: "700px",
            height: "500px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#1890ff",
              color: "white",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              {selectedUser ? selectedUser.name : "Tin nhắn"}
            </h3>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              style={{ color: "white" }}
            />
          </div>

          {/* Content */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* User List */}
            <div
              style={{
                width: "250px",
                borderRight: "1px solid #f0f0f0",
                overflowY: "auto",
              }}
            >
              {chatRooms.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  <Empty
                    description="Chưa có cuộc trò chuyện"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                chatRooms.map((room) => {
                  const otherUserId = room.participants.find(
                    (id) => id !== currentUserId
                  );
                  const userInfo = otherUserId
                    ? userInfoCache.get(otherUserId)
                    : null;

                  if (!userInfo) return null;

                  return (
                    <div
                      key={room.id}
                      onClick={() => handleSelectUser(room)}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor:
                          selectedUser?.id === userInfo.id
                            ? "#e6f7ff"
                            : "transparent",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedUser?.id !== userInfo.id) {
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedUser?.id !== userInfo.id) {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={userInfo.avatar}
                          icon={<UserOutlined />}
                          size={40}
                        />
                        <div
                          style={{
                            marginLeft: "12px",
                            flex: 1,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 500,
                              marginBottom: "4px",
                              fontSize: "14px",
                            }}
                          >
                            {userInfo.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {room.lastMessage?.text || "Bắt đầu trò chuyện"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {!selectedUser ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  <Empty description="Chọn một cuộc trò chuyện để bắt đầu" />
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "16px",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {loading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "20px",
                        }}
                      >
                        <Spin />
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#999" }}>
                        Chưa có tin nhắn
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.senderId === currentUserId;
                        const hasImages = msg.images && msg.images.length > 0;
                        const hasText = msg.text && msg.text.trim().length > 0;
                        
                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              justifyContent: isOwn ? "flex-end" : "flex-start",
                              marginBottom: "12px",
                            }}
                          >
                            <div
                              style={{
                                maxWidth: "70%",
                                padding: hasImages ? "8px" : "8px 12px",
                                borderRadius: "12px",
                                backgroundColor: isOwn ? "#1890ff" : "white",
                                color: isOwn ? "white" : "#333",
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              {/* Images */}
                              {hasImages && (
                                <div style={{ marginBottom: hasText ? "8px" : "0" }}>
                                  <Image.PreviewGroup>
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: msg.images!.length === 1 ? "1fr" : "repeat(2, 1fr)",
                                        gap: "4px",
                                      }}
                                    >
                                      {msg.images!.map((imgUrl, index) => (
                                        <Image
                                          key={index}
                                          src={getCloudinaryUrl(imgUrl)}
                                          alt={`Image ${index + 1}`}
                                          style={{
                                            width: "100%",
                                            height: msg.images!.length === 1 ? "auto" : "120px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </Image.PreviewGroup>
                                </div>
                              )}
                              
                              {/* Text */}
                              {hasText && (
                                <div style={{ padding: hasImages ? "0 4px" : "0" }}>
                                  {msg.text}
                                </div>
                              )}
                              
                              {/* Timestamp */}
                              <div
                                style={{
                                  fontSize: "10px",
                                  marginTop: "4px",
                                  opacity: 0.7,
                                  textAlign: "right",
                                  padding: hasImages ? "0 4px" : "0",
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div>
                    {/* Image Preview */}
                    {fileList.length > 0 && (
                      <div
                        style={{
                          padding: "8px 16px",
                          borderTop: "1px solid #f0f0f0",
                          backgroundColor: "#fafafa",
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          maxHeight: "150px",
                          overflowY: "auto",
                        }}
                      >
                        {fileList.map((file) => (
                          <div
                            key={file.uid}
                            style={{
                              position: "relative",
                              width: "80px",
                              height: "80px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            <img
                              src={file.url}
                              alt={file.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveFile(file.uid)}
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                color: "white",
                                padding: "2px 4px",
                                minWidth: "auto",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input Area */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderTop: fileList.length === 0 ? "1px solid #f0f0f0" : "none",
                        backgroundColor: "white",
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-end",
                      }}
                    >
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                      
                      {/* Image Upload Button */}
                      <Button
                        type="text"
                        icon={<PictureOutlined />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || uploading}
                        size="large"
                        style={{ flexShrink: 0 }}
                      />
                      
                      {/* Text Input */}
                      <Input
                        placeholder="Nhập tin nhắn..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onPressEnter={(e) => {
                          e.preventDefault();
                          if (!sending && !uploading && (messageText.trim() || fileList.length > 0)) {
                            handleSendMessage();
                          }
                        }}
                        size="large"
                        disabled={sending || uploading}
                        style={{ flex: 1 }}
                      />
                      
                      {/* Send Button */}
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        loading={sending || uploading}
                        disabled={sending || uploading || (!messageText.trim() && fileList.length === 0)}
                        size="large"
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
