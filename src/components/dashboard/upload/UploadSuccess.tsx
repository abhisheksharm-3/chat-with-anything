"use client"

import React from 'react';
import { Upload, X } from 'lucide-react';

interface UploadSuccessProps {
  fileName: string;
  handleRemoveFile: () => void;
}

const UploadSuccess: React.FC<UploadSuccessProps> = ({ 
  fileName, 
  handleRemoveFile 
}) => {
  return (
    <div className="border border-dashed border-[#333] rounded-lg p-6 text-center mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-2">
            <Upload size={16} className="text-primary" />
          </div>
          <span className="text-sm">{fileName}</span>
        </div>
        <button 
          className="text-primary hover:text-primary/90 cursor-pointer"
          onClick={handleRemoveFile}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default UploadSuccess; 