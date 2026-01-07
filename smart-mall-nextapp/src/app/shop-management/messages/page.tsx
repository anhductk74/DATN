"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Card, 
  Avatar, 
  Badge, 
  Input, 
  Button, 
  Empty, 
  Spin,
  Image,
  App as AntApp
} from "antd";
import { 
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  PictureOutlined,
  DeleteOutlined,
  SearchOutlined
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { ChatService } from "@/services/ChatService";
import { ImageUploadService } from "@/services/ImageUploadService";
import { Message, ChatRoom, UserInfo, ChatUser } from "@/types/chat";
import { useSession } from "next-auth/react";
import { getCloudinaryUrl } from "@/config/config";

export default function MessagesPage() {
  const { data: session } = useSession();
  const { message: messageApi } = AntApp.useApp();
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
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = session?.user?.id || "";

  // Listen to chat rooms
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

  // Load user information
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

  // Listen to messages when user is selected
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

    // Mark as read
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
    if ((!messageText.trim() && fileList.length === 0) || !selectedUser || !currentUserId || sending) {
      return;
    }

    const textToSend = messageText.trim();
    const filesToUpload = [...fileList];
    
    try {
      setSending(true);
      setMessageText("");
      setFileList([]);
      
      // Upload images if any
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
        } catch (error) {
          console.error('Error uploading images:', error);
          messageApi.error('Error uploading images');
          setMessageText(textToSend);
          setFileList(filesToUpload);
          return;
        } finally {
          setUploading(false);
        }
      }
      
      // Send message
      await ChatService.sendMessage(
        currentUserId,
        selectedUser.id,
        textToSend,
        imageUrls.length > 0 ? imageUrls : undefined
      );
    } catch (error) {
      console.error("Error sending message:", error);
      messageApi.error('Error sending message');
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
        const validation = ImageUploadService.validateImage(file);
        if (!validation.valid) {
          messageApi.error(validation.error || 'Invalid file');
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

  const filteredChatRooms = chatRooms.filter((room) => {
    if (!searchTerm) return true;
    const otherUserId = room.participants.find((id) => id !== currentUserId);
    const userInfo = otherUserId ? userInfoCache.get(otherUserId) : null;
    return userInfo?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!session) {
    return (
      <Card>
        <Empty description="Please login to access messages" />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageOutlined style={{ fontSize: "20px" }} />
          <span>Messages</span>
        </div>
      }
      style={{ height: "calc(100vh - 140px)" }}
      bodyStyle={{ padding: 0, height: "calc(100% - 57px)" }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        {/* User List */}
        <div
          style={{
            width: "320px",
            borderRight: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fafafa",
          }}
        >
          {/* Search */}
          <div style={{ padding: "16px", borderBottom: "1px solid #e8e8e8", backgroundColor: "white" }}>
            <Input
              placeholder="Search conversations..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>

          {/* Chat Rooms List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredChatRooms.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Empty
                  description={searchTerm ? "No conversations found" : "No conversations yet"}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              filteredChatRooms.map((room) => {
                const otherUserId = room.participants.find(
                  (id) => id !== currentUserId
                );
                const userInfo = otherUserId
                  ? userInfoCache.get(otherUserId)
                  : null;

                if (!userInfo) return null;

                const isSelected = selectedUser?.id === userInfo.id;
                const hasUnread = room.lastMessage && room.lastMessage.senderId !== currentUserId && !isSelected;

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
                      borderLeft: isSelected ? "3px solid #1890ff" : "3px solid transparent",
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
                      <Badge dot={hasUnread}>
                        <Avatar
                          src={userInfo.avatar}
                          icon={<UserOutlined />}
                          size={48}
                          style={{ flexShrink: 0 }}
                        />
                      </Badge>
                      <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: hasUnread ? 600 : 400,
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
                      {room.lastMessageTime && (
                        <div style={{ fontSize: "11px", color: "#8c8c8c" }}>
                          {formatTime(room.lastMessageTime)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
              }}
            >
              <Empty 
                description="Select a conversation to start messaging"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              {/* Chat Header */}
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
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                    {selectedUser.name}
                  </h4>
                  <div style={{ fontSize: "13px", color: "#52c41a", marginTop: "2px" }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      display: "inline-block",
                      marginRight: "4px",
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
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
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
                          
                          {hasText && (
                            <div style={{ 
                              padding: hasImages ? "0 6px" : "0",
                              fontSize: "14px",
                              lineHeight: "1.5",
                            }}>
                              {msg.text}
                            </div>
                          )}
                          
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

              {/* Input Area */}
              <div style={{ backgroundColor: "white", borderTop: "1px solid #e8e8e8" }}>
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
                
                {/* Input Controls */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-end",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  
                  <Button
                    type="text"
                    icon={<PictureOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || uploading}
                    size="large"
                    style={{ flexShrink: 0, color: "#1890ff", fontSize: "20px" }}
                  />
                  
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
                    style={{ flex: 1, borderRadius: "24px", padding: "8px 20px" }}
                  />
                  
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
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
