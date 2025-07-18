"use client"

import React from 'react';
import { Send } from 'lucide-react';
import { TypeFileTypeConfig } from '@/types/types';

interface UrlInputProps {
  url: string;
  fileTypeConfig: TypeFileTypeConfig;
  isUrlOnly: boolean;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlSubmit: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({
  url,
  fileTypeConfig,
  isUrlOnly,
  handleUrlChange,
  handleUrlSubmit,
  handleKeyDown,
  isUploading
}) => {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 mb-1">
        {isUrlOnly ? `Enter ${fileTypeConfig.name} URL` : 'Import from URL'}
      </p>
      <div className="relative">
        <input
          type="text"
          placeholder="https://"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary pr-10"
        />
        <button 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
            url.trim() ? 'text-white' : 'text-gray-400'
          } hover:text-white`}
          onClick={handleUrlSubmit}
          disabled={!url.trim() || isUploading}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default UrlInput; 