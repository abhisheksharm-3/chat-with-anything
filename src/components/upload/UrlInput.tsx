"use client"

import React, { useState, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { TypeFileTypeConfig } from '@/types/types';
import { isYoutubeUrl } from '@/utils/processors/youtube-utils';

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
  const [isYouTube, setIsYouTube] = useState(false);
  
  // Check if the URL is a YouTube URL
  useEffect(() => {
    setIsYouTube(isYoutubeUrl(url));
  }, [url]);
  
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
      
      {/* YouTube-specific message */}
      {isYouTube && (
        <div className="mt-2 flex items-start gap-2 bg-blue-900/20 p-2 rounded-md">
          <AlertCircle size={16} className="text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-400">
            Note: Only YouTube videos with available captions/transcripts can be processed. 
            Private or automatically generated captions may not work.
          </p>
        </div>
      )}
    </div>
  );
};

export default UrlInput; 