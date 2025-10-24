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
          messageApi.error('Error uploading images');
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
      messageApi.error('Error sending message');
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
        messageApi.error(validation.error || 'Invalid file');
        return null;
      }        return {
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
            width: "750px",
            height: "600px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
              💬 Messages
            </h3>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              style={{ 
                color: "white",
                fontSize: "16px",
              }}
              size="large"
            />
          </div>

          {/* Content */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* User List */}
            <div
              style={{
                width: "280px",
                borderRight: "1px solid #e8e8e8",
                overflowY: "auto",
                backgroundColor: "#fafafa",
              }}
            >
              {chatRooms.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                  }}
                >
                  <Empty
                    description="No conversations yet"
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

                  const isSelected = selectedUser?.id === userInfo.id;

                  return (
                    <div
                      key={room.id}
                      onClick={() => handleSelectUser(room)}
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor: isSelected ? "#e6f7ff" : "white",
                        transition: "all 0.2s ease",
                        borderLeft: isSelected ? "3px solid #667eea" : "3px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "white";
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Badge dot={room.lastMessage && !isSelected}>
                          <Avatar
                            src={userInfo.avatar}
                            icon={<UserOutlined />}
                            size={48}
                            style={{ flexShrink: 0 }}
                          />
                        </Badge>
                        <div
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: "4px",
                              fontSize: "14px",
                              color: "#262626",
                            }}
                          >
                            {userInfo.name}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#8c8c8c",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {room.lastMessage?.text || "Start conversation"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f8f9fa" }}>
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
                  <Empty 
                    description="Select a conversation to start"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <>
                  {/* Chat Header with User Info */}
                  <div
                    style={{
                      padding: "16px 24px",
                      borderBottom: "1px solid #e8e8e8",
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Avatar
                      src={selectedUser.avatar}
                      icon={<UserOutlined />}
                      size={44}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: "16px", 
                        fontWeight: 600,
                        color: "#262626",
                      }}>
                        {selectedUser.name}
                      </h4>
                      <div style={{ 
                        fontSize: "13px", 
                        color: "#52c41a",
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        <span style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#52c41a",
                          display: "inline-block",
                        }}></span>
                        Online
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "20px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {loading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "40px",
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
                        <Empty 
                          description="No messages yet. Start the conversation!"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
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
                              alignItems: "flex-end",
                              gap: "8px",
                            }}
                          >
                            {!isOwn && (
                              <Avatar
                                src={selectedUser?.avatar}
                                icon={<UserOutlined />}
                                size={32}
                                style={{ flexShrink: 0 }}
                              />
                            )}
                            <div
                              style={{
                                maxWidth: "65%",
                                padding: hasImages ? "6px" : "10px 14px",
                                borderRadius: isOwn 
                                  ? "18px 18px 4px 18px" 
                                  : "18px 18px 18px 4px",
                                background: isOwn 
                                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                                  : "white",
                                color: isOwn ? "white" : "#262626",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                wordBreak: "break-word",
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
                                        gap: "6px",
                                      }}
                                    >
                                      {msg.images!.map((imgUrl, index) => (
                                        <Image
                                          key={index}
                                          src={getCloudinaryUrl(imgUrl)}
                                          alt={`Image ${index + 1}`}
                                          style={{
                                            width: "100%",
                                            height: msg.images!.length === 1 ? "auto" : "140px",
                                            maxHeight: msg.images!.length === 1 ? "300px" : "140px",
                                            objectFit: "cover",
                                            borderRadius: "12px",
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
                                <div style={{ 
                                  padding: hasImages ? "0 6px" : "0",
                                  fontSize: "14px",
                                  lineHeight: "1.5",
                                }}>
                                  {msg.text}
                                </div>
                              )}
                              
                              {/* Timestamp */}
                              <div
                                style={{
                                  fontSize: "11px",
                                  marginTop: "4px",
                                  opacity: 0.7,
                                  textAlign: "right",
                                  padding: hasImages ? "0 6px" : "0",
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
                  <div style={{ 
                    backgroundColor: "white",
                    borderTop: "1px solid #e8e8e8",
                  }}>
                    {/* Image Preview */}
                    {fileList.length > 0 && (
                      <div
                        style={{
                          padding: "12px 20px",
                          backgroundColor: "#fafafa",
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          maxHeight: "180px",
                          overflowY: "auto",
                        }}
                      >
                        {fileList.map((file) => (
                          <div
                            key={file.uid}
                            style={{
                              position: "relative",
                              width: "90px",
                              height: "90px",
                              borderRadius: "12px",
                              overflow: "hidden",
                              border: "2px solid #e8e8e8",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                                top: "4px",
                                right: "4px",
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                color: "white",
                                padding: "4px",
                                minWidth: "auto",
                                height: "auto",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input Area */}
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        gap: "12px",
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
                        style={{ 
                          flexShrink: 0,
                          color: "#667eea",
                          fontSize: "20px",
                        }}
                      />
                      
                      {/* Text Input */}
                      <Input
                        placeholder="Type a message..."
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
                        style={{ 
                          flex: 1,
                          borderRadius: "24px",
                          padding: "8px 20px",
                        }}
                      />
                      
                      {/* Send Button */}
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        loading={sending || uploading}
                        disabled={sending || uploading || (!messageText.trim() && fileList.length === 0)}
                        size="large"
                        style={{ 
                          flexShrink: 0,
                          borderRadius: "50%",
                          width: "48px",
                          height: "48px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                        }}
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
