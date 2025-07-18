"use client"

import React from 'react';
import { TypeFileTypeConfig } from '@/types/types';

interface UploadAreaProps {
  fileTypeConfig: TypeFileTypeConfig;
  selectedFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ 
  fileTypeConfig, 
  selectedFile, 
  handleFileChange 
}) => {
  return (
    <div className="border border-dashed border-[#333] rounded-lg p-6 text-center mb-4">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept={fileTypeConfig.accept}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <p className="text-sm">
          <span className="text-primary hover:text-primary/90 cursor-pointer">
            Click to upload
          </span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {fileTypeConfig.name} (max. {fileTypeConfig.maxSize / (1024 * 1024)}MB)
        </p>
      </label>
      {selectedFile && (
        <div className="mt-2 text-sm text-gray-300">
          Selected: {selectedFile.name}
        </div>
      )}
    </div>
  );
};

export default UploadArea; 