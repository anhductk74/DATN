"use client";

import React, { useState } from "react";
import { GiClothes } from "react-icons/gi";
import VirtualTryOn from "./VirtualTryOn";

/**
 * Floating Widget for Virtual Try-On
 * Displays at the same level as Chatbot and ChatWidget
 */
const VirtualTryOnWidget: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-[152px] right-6 z-50 rounded-full w-14 h-14 bg-blue-600 shadow-lg flex items-center justify-center hover:bg-blue-700 hover:shadow-xl transition-all border-2 border-white group"
        aria-label="Virtual Try-On"
        title="Virtual Try-On - Try clothes with AI"
      >
        <GiClothes className="text-white text-2xl transition-transform group-hover:scale-110" />
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI</div>
      </button>

      {/* Virtual Try-On Modal */}
      <VirtualTryOn
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default VirtualTryOnWidget;
