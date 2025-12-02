"use client";

import React, { useRef } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File, preview: string) => void;
  label?: string;
  preview?: string;
  className?: string;
  compact?: boolean;
  imageFit?: 'cover' | 'contain';
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  label = "Upload Image", 
  preview,
  className = "",
  compact = false,
  imageFit = 'cover'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-gray-50 overflow-hidden group ${className}`}
      onClick={triggerUpload}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {preview ? (
        <div className="w-full h-full relative">
          <img 
            src={preview} 
            alt="Preview" 
            className={`w-full h-full ${imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`} 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium flex items-center gap-2">
              <Upload size={16} /> Change
            </span>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center h-full text-gray-500 ${compact ? 'p-4' : 'p-8'}`}>
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-full mb-3 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
            {compact ? <Upload size={20} className="text-indigo-600" /> : <ImageIcon size={32} className="text-indigo-600" />}
          </div>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-center text-gray-700`}>{label}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
