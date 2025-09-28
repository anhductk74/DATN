"use client";

import { useEffect } from "react";
import { CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", show, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleOutlined className="text-green-500 text-xl" />;
      case "error":
        return <CloseOutlined className="text-red-500 text-xl" />;
      default:
        return <CheckCircleOutlined className="text-blue-500 text-xl" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${getBgColor()} border rounded-2xl p-4 shadow-lg backdrop-blur-sm max-w-md`}>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <p className="text-gray-800 font-medium flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}