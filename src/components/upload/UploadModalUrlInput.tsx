"use client";

import { useState, useEffect } from "react";
import { Send, AlertCircle } from "lucide-react";
import { TypeUploadModalUrlInputProps } from "@/types/TypeUpload";
import { isYoutubeUrl } from "@/utils/youtube-utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

/**
 * A controlled input component for users to submit a URL for processing.
 *
 * It includes a submit button within the input field and can be disabled during
 * upload operations. It has special logic to detect YouTube URLs and display a
 * relevant informational message to the user.
 *
 * @component
 * @param {TypeUploadModalUrlInputProps} props - The properties for the component.
 * @param {string} props.url - The current value of the URL input field.
 * @param {{ name: string }} props.fileTypeConfig - Configuration object containing the display name for the expected URL type.
 * @param {boolean} props.isUrlOnly - If true, adjusts the label to reflect that only a URL is accepted.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.handleUrlChange - The callback function for the input's `onChange` event.
 * @param {() => void} props.handleUrlSubmit - The callback function for the submit button's `onClick` event.
 * @param {(event: React.KeyboardEvent<HTMLInputElement>) => void} props.handleKeyDown - The callback function for the input's `onKeyDown` event.
 * @param {boolean} props.isUploading - A flag to disable the submit button while an upload is in progress.
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
   * Effect to check if the currently entered URL is a YouTube link
   * and update the state accordingly.
   */
  useEffect(() => {
    setIsYouTube(isYoutubeUrl(url));
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

      {/* YouTube-specific message */}
      {isYouTube && (
        <div className="mt-2 flex items-start gap-2 bg-blue-900/20 p-2 rounded-md">
          <AlertCircle size={16} className="text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-400">
            Note: Only YouTube videos with available captions/transcripts can be
            processed. Private or automatically generated captions may not work.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadModalUrlInput;
