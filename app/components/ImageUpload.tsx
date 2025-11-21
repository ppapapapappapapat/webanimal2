import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  defaultImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, defaultImageUrl }) => {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageSelect(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageSelect(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <div className="relative w-full h-48">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
            />
          </div>
        ) : (
          <div className="py-8">
            <div className="text-gray-500 mb-2">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <span className="text-blue-600 hover:text-blue-500">Upload a file</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload; 