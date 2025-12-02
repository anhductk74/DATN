"use client";

import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose, title = "Image Preview" }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <a 
            href={imageUrl} 
            download="virtual-tryon-image.png"
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-md"
            title="Download"
          >
            <Download size={24} />
          </a>
          <button 
            onClick={onClose}
            className="bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full transition-colors backdrop-blur-md"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg">
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
          />
        </div>
        
        <div className="mt-4 text-center text-gray-300 text-sm bg-black/50 backdrop-blur-md py-2 px-4 rounded-full inline-block mx-auto\">\n          {title}\n        </div>
      </div>
    </div>
  );
};

export default ImageModal;
