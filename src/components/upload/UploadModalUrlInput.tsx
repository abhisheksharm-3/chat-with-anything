"use client";

import { useState, useEffect } from "react";
import { Send, AlertCircle } from "lucide-react";
import { TypeUploadModalUrlInputProps } from "@/types/TypeUpload";
import { extractYoutubeVideoId } from "@/utils/youtube-utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

/**
 * A controlled input component for submitting a URL for processing.
 *
 * It features a submit button and displays a specific informational message
 * when a YouTube URL is detected.
 *
 * @param {TypeUploadModalUrlInputProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered URL input component.
 */
const UploadModalUrlInput: React.FC<TypeUploadModalUrlInputProps> = ({
  url,
  fileTypeConfig,
  isUrlOnly,
  handleUrlChange,
  handleUrlSubmit,
  handleKeyDown,
  isUploading,
}) => {
  const [isYouTube, setIsYouTube] = useState(false);

  /**
   * Checks if the entered URL is a YouTube link to conditionally show a help message.
   */
  useEffect(() => {
    setIsYouTube(!!extractYoutubeVideoId(url));
  }, [url]);

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 mb-1">
        {isUrlOnly ? `Enter ${fileTypeConfig.name} URL` : "Import from URL"}
      </p>
      <div className="relative">
        <Input
          type="text"
          placeholder="https://"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          className="pr-10"
          disabled={isUploading}
        />
        <Button
          size="icon"
          variant="ghost"
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            url.trim() ? "text-white" : "text-gray-400"
          } hover:text-white`}
          onClick={handleUrlSubmit}
          disabled={!url.trim() || isUploading}
          aria-label="Submit URL"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Conditional message for YouTube URLs */}
      {isYouTube && (
        <div className="mt-2 flex items-start gap-2 bg-blue-900/20 p-2 rounded-md">
          <AlertCircle size={16} className="text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-400">
            Note: Only videos with available captions can be processed. Private or
            auto-generated captions may not work.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadModalUrlInput;