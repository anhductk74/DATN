"use client";

import React from 'react';
import { Trash2, ArrowRight, Loader2, Shirt, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { GarmentItem as GarmentItemType, ProcessingStatus, GARMENT_TYPES } from '@/types/virtualTryOn';
import FileUploader from './FileUploader';

interface GarmentItemProps {
  garment: GarmentItemType;
  onRemove: (id: string) => void;
  onUpdateImage: (id: string, file: File, preview: string) => void;
  onUpdatePrompt: (id: string, prompt: string) => void;
  onRetry: (id: string) => void;
}

const GarmentItemComponent: React.FC<GarmentItemProps> = ({ 
  garment, 
  onRemove, 
  onUpdateImage, 
  onUpdatePrompt, 
  onRetry 
}) => {
  const isProcessing = garment.status === ProcessingStatus.PROCESSING;
  const isCompleted = garment.status === ProcessingStatus.COMPLETED;
  const isFailed = garment.status === ProcessingStatus.FAILED;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch">
      {/* Input Section */}
      <div className="flex-1 w-full md:w-auto flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            {GARMENT_TYPES.find((t) => t.value === garment.type)?.label}
          </span>
          <button 
            onClick={() => onRemove(garment.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        <div className="h-40 w-full mb-2">
          <FileUploader 
            onFileSelect={(file, preview) => onUpdateImage(garment.id, file, preview)} 
            preview={garment.preview}
            label={`Upload ${garment.type}`}
            compact
            className="h-full"
            imageFit="contain"
          />
        </div>
        
        <input 
          type="text" 
          placeholder="Optional: Describe item (e.g., 'Red striped shirt', 'Blue jeans on left')"
          value={garment.customPrompt || ''}
          onChange={(e) => onUpdatePrompt(garment.id, e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full"
        />
        <p className="text-[10px] text-gray-500 mt-1 pl-1">
          💡 Use color/position hints when photo has multiple items (e.g., &quot;white sneakers with pink laces&quot;)
        </p>
      </div>

      {/* Arrow */}
      <div className="flex justify-center items-center">
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-2 text-indigo-600">
          <ArrowRight size={20} className="md:rotate-0 rotate-90" />
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 w-full md:w-auto flex flex-col">
        <div className="mb-2 flex items-center justify-between h-7">
          <span className="text-gray-700 text-xs font-medium uppercase">Extracted Item</span>
          {isProcessing && (
            <span className="text-indigo-600 text-xs flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Extracting...
            </span>
          )}
          {isCompleted && (
            <span className="text-green-600 text-xs flex items-center gap-1">
              <CheckCircle2 size={12} /> Ready
            </span>
          )}
          {isFailed && (
            <span className="text-red-600 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> Failed
            </span>
          )}
        </div>
        
        <div
          className={`h-40 w-full rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden relative mb-2 ${
            isCompleted
              ? 'border-green-400 bg-green-50'
              : isFailed
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          {garment.extractedBase64 ? (
            <img 
              src={garment.extractedBase64} 
              alt="Extracted" 
              className="w-full h-full object-contain p-2" 
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin text-indigo-500 mb-2" />
              ) : (
                <Shirt size={24} className="mb-2 opacity-50" />
              )}
              <span className="text-xs">
                {isProcessing ? 'Isolating...' : 'Waiting to process'}
              </span>
            </div>
          )}
        </div>

        <div className="h-8 flex items-center justify-end">
          {(isCompleted || isFailed) && !isProcessing && (
            <button 
              onClick={() => onRetry(garment.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-300"
              title="Try extracting this item again"
            >
              <RefreshCw size={12} /> {isFailed ? 'Retry' : 'Redo Extraction'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GarmentItemComponent;
