"use client"

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UploadErrorProps {
  error: string;
  handleRetry: () => void;
}

const UploadError: React.FC<UploadErrorProps> = ({ 
  error, 
  handleRetry 
}) => {
  return (
    <div className="border border-dashed border-red-500 rounded-lg p-6 text-center mb-4">
      <div className="flex items-center justify-center mb-2">
        <AlertCircle className="text-red-500 h-5 w-5 mr-2" />
        <p className="text-sm text-red-500 font-medium">Upload Failed</p>
      </div>
      <p className="text-sm text-red-400">{error || 'An error occurred during upload'}</p>
      <button
        className="mt-3 text-primary hover:text-primary/90 text-sm"
        onClick={handleRetry}
      >
        Try again
      </button>
    </div>
  );
};

export default UploadError; 