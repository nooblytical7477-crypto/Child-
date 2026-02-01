import React, { useRef, useState } from 'react';
import { Button } from './Button';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onCameraSelect: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, onCameraSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
       <div 
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center h-80
          ${isDragging 
            ? 'border-[#c02126] bg-red-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-[#c02126] hover:bg-red-50/30 bg-white'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#c02126]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload your photo</h3>
        <p className="text-slate-500 mb-6">Drag and drop or click to browse</p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
           <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="primary"
            fullWidth
          >
            Choose File
          </Button>
          <Button 
            onClick={onCameraSelect} 
            variant="outline"
            fullWidth
          >
            Take Photo
          </Button>
        </div>
      </div>
    </div>
  );
};