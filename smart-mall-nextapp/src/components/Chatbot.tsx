/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { IoMdChatboxes } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { FaStar, FaStarHalf } from "react-icons/fa";

const API_URL = `${process.env.NEXT_PUBLIC_URL_PYTHON}/ai_chatbot`;

// Types for product data
interface Product {
  id: string;
  name: string;
  image: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  rating: number;
  reviewCount: number;
  shopName: string;
  link: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
}



function useSessionChatHistory(initialHistory: ChatMessage[]) {
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("chatbot-history");
      return saved ? JSON.parse(saved) : initialHistory;
    }
    return initialHistory;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("chatbot-history", JSON.stringify(history));
    }
  }, [history]);

  return [history, setHistory] as const;
}

// Function để parse markdown (links, bold, italic, lists)
function parseMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Check for bullet points
    if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
      const content = line.trim().substring(1).trim();
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-4 mb-1">
          {parseInlineMarkdown(content)}
        </li>
      );
    } 
    // Check for numbered lists
    else if (/^\d+\./.test(line.trim())) {
      const content = line.trim().replace(/^\d+\.\s*/, '');
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-4 mb-1 list-decimal">
          {parseInlineMarkdown(content)}
        </li>
      );
    }
    // Regular text
    else if (line.trim()) {
      elements.push(
        <p key={`p-${lineIndex}`} className="mb-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
    // Empty line
    else {
      elements.push(<br key={`br-${lineIndex}`} />);
    }
  });

  return elements;
}

// Function để parse inline markdown (bold, italic, links)
function parseInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  // Pattern để tìm markdown: **bold**, *italic*, [link](url)
  const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Thêm text trước match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }

    // Check loại markdown
    if (match[1]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index} className="italic">{match[4]}</em>);
    } else if (match[5]) {
      // [text](url)
      parts.push(
        <a
          key={match.index}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {match[6]}
        </a>
      );
    }

    currentIndex = match.index + match[0].length;
  }

  // Thêm phần text còn lại
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Component để render message với markdown support
function MessageContent({ text }: { text: string }) {
  const elements = parseMarkdown(text);

  return (
    <div className="space-y-1">
      {elements}
    </div>
  );
}

// Component để render product cards
function ProductCard({ product }: { product: Product }) {
  const renderStars = (rating: number) => {
    const rate = rating || 0;
    const stars = [];
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half" className="text-yellow-400 text-xs" />);
    }

    return stars;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white mb-2">
      <div className="flex gap-3">
        {product.image && (
          <div className="flex-shrink-0">
            <img
              src={product.image.replace('cloudinary.com//', 'cloudinary.com/')}
              alt={product.name}
              width={60}
              height={60}
              className="rounded-md object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs text-gray-800 line-clamp-2 mb-1">
            {product.name}
          </h4>
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <div className="flex items-center gap-1 mb-1">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
          <div className="text-sm font-semibold text-red-600 mb-2">
            {product.minPrice === product.maxPrice 
              ? `${product.minPrice.toLocaleString()} VNĐ`
              : `${product.minPrice.toLocaleString()} - ${product.maxPrice.toLocaleString()} VNĐ`
            }
          </div>
          <div className="flex gap-2">
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 text-white text-xs py-1 px-2 rounded text-center hover:bg-blue-700 transition"
            >
              View Product
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [anim, setAnim] = useState(false);
  const [history, setHistory] = useSessionChatHistory([
    {
      role: "assistant",
      text: "Hello! I'm Smart-mall AI Assistant. I can help you find the best products that match your needs. What kind of item are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, open, showTyping]);

  // Animation open/close modal
  useEffect(() => {
    if (open) {
      setAnim(true);
    } else {
      setTimeout(() => setAnim(false), 300);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newHistory: ChatMessage[] = [...history, { role: "user", text: input }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setShowTyping(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });
      console.log("API_URL:", API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHistory([...newHistory, { 
        role: "assistant", 
        text: data.reply,
        products: data.products || []
      }]);
    } catch (err) {
      console.error("Chat error:", err);
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          text: "Xin lỗi, có lỗi kết nối server. Vui lòng thử lại sau.",
        },
      ]);
    }
    setLoading(false);
    setShowTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  const clearHistory = () => {
    const initialHistory: ChatMessage[] = [
      {
        role: "assistant" as const,
        text: "Hello! I'm Smart-mall AI Assistant. I can help you find the best products that match your needs. What kind of item are you looking for today?",
      },
    ];
    setHistory(initialHistory);
  };

  return (
    <>
      {/* Floating Button */}
  <button
  onClick={() => setOpen(true)}
  className={`fixed bottom-22 right-6 z-99 rounded-full w-14 h-14 overflow-hidden shadow-xl flex items-center justify-center hover:scale-105 hover:shadow-2xl transition-transform duration-300 border-2 border-blue-500 ${
    open
      ? "scale-0 opacity-0 pointer-events-none"
      : "scale-100 opacity-100"
  }`}
  aria-label="Open Smart-mall AI Assistant"
>
  <Image
    src="/images/chatbox.webp"
    alt="Chatbot"
    width={56}
    height={56}
    className="w-full h-full object-cover"
  />
</button>


      {/* Chat Modal */}
      {anim && (
        <div
          className={`fixed bottom-28 right-8 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl max-w-sm w-full h-[520px] flex flex-col transition-all duration-300 ${
            open
              ? "scale-100 opacity-100"
              : "scale-90 opacity-0 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
            <span className="font-semibold flex gap-2 items-center  ">
              <IoMdChatboxes />
              Smart-mall AI Assistant
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearHistory}
                className="text-white/80 hover:text-white text-xl px-2 py-1 rounded hover:bg-white/10 transition"
                title="Clear chat"
              >
                <MdDeleteForever />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white text-2xl font-bold hover:text-gray-200 w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {history.map((msg: ChatMessage, idx: number) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="flex items-end mr-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Image
                        src="/images/chatbox.webp"
                        alt="Bot"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : ""}`}>
                  {/* Message Bubble */}
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                    } text-sm leading-relaxed mb-2`}
                  >
                    {msg.role === "assistant" ? (
                      <MessageContent text={msg.text} />
                    ) : (
                      <div className="whitespace-pre-line">{msg.text}</div>
                    )}
                  </div>

                  {/* Product Cards */}
                  {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {msg.products.map((product, pIdx) => (
                        <ProductCard key={pIdx} product={product} />
                      ))}
                    </div>
                  )}
                </div>

                {/* User spacing */}
                {msg.role === "user" && <div className="w-2" />}
              </div>
            ))}

            {/* Typing Indicator */}
            {showTyping && (
              <div className="flex justify-start">
                <div className="flex items-end mr-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Image
                      src="/images/chatbox.webp"
                      alt="Bot"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="inline-block rounded-2xl rounded-bl-md px-4 py-3 bg-white border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your message..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              <p>
                💡 Questions about rental rooms, prices, locations, or
                amenities?
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
