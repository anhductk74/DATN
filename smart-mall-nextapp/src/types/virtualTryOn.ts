export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface GarmentItem {
  id: string;
  file: File | null;
  type: 'shirt' | 'pants' | 'shoes' | 'hat' | 'dress' | 'jacket' | 'skirt' | 'accessories';
  customPrompt?: string;
  extractedBase64?: string;
  preview: string;
  status: ProcessingStatus;
  errorMessage?: string;
}

export const GARMENT_TYPES = [
  { value: 'shirt', label: 'Shirt/Top' },
  { value: 'pants', label: 'Pants/Trousers' },
  { value: 'dress', label: 'Dress' },
  { value: 'jacket', label: 'Jacket/Coat' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'hat', label: 'Hat/Headwear' },
  { value: 'accessories', label: 'Accessories' },
] as const;
