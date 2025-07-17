"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFiles } from "@/hooks";
import { Loader2, Upload, Link as LinkIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChats } from "@/hooks";

interface FileUploaderProps {
  onSuccess?: (fileId: string, chatId: string) => void;
  onError?: (error: Error) => void;
}

export default function FileUploader({ onSuccess, onError }: FileUploaderProps) {
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFiles();
  const { createChat, updateChat } = useChats();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "application/msword", // doc
        "text/plain",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.ms-excel", // xls
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("File type not supported");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create a new chat first
      const chatData = await createChat({
        title: `Chat about ${url}`,
        type: "web",
        file_id: null,
      });

      // Store URL in the files table
      const fileData = await uploadFile({
        file: new File([""], "url_placeholder.txt", { type: "text/plain" }),
        fileData: {
          name: url,
          type: "url",
          size: 0,
          context: { url },
          is_text_extracted: false,
          full_text: null,
        },
      });

      // Update the chat with the file ID
      if (chatData && fileData) {
        await updateChat({
          chatId: chatData.id,
          chatData: {
            file_id: fileData.id
          }
        });
        
        // Redirect to the chat page
        router.push(`/chat/${chatData.id}`);
        
        if (onSuccess) {
          onSuccess(fileData.id, chatData.id);
        }
      }
    } catch (err) {
      console.error("Error processing URL:", err);
      setError("Failed to process URL. Please try again.");
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Determine file type for chat type
      let chatType: "pdf" | "doc" | "image" | "sheet" | "slides" | null = null;
      
      if (selectedFile.type.includes("pdf")) {
        chatType = "pdf";
      } else if (selectedFile.type.includes("word") || selectedFile.type.includes("text")) {
        chatType = "doc";
      } else if (selectedFile.type.includes("image")) {
        chatType = "image";
      } else if (selectedFile.type.includes("sheet") || selectedFile.type.includes("excel")) {
        chatType = "sheet";
      } else if (selectedFile.type.includes("presentation") || selectedFile.type.includes("powerpoint")) {
        chatType = "slides";
      }

      // Create a new chat first
      const chatData = await createChat({
        title: `Chat about ${selectedFile.name}`,
        type: chatType,
        file_id: null,
      });

      // Upload the file
      const fileData = await uploadFile({
        file: selectedFile,
        fileData: {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          is_text_extracted: false,
          full_text: null,
          context: null,
        },
      });

      // Update the chat with the file ID
      if (chatData && fileData) {
        await updateChat({
          chatId: chatData.id,
          chatData: {
            file_id: fileData.id
          }
        });
        
        // Redirect to the chat page
        router.push(`/chat/${chatData.id}`);
        
        if (onSuccess) {
          onSuccess(fileData.id, chatData.id);
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toggle between file upload and URL input */}
      <div className="flex mb-4 bg-[#1a1a1a] rounded-lg p-1">
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium ${
            isUploadMode
              ? "bg-primary text-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setIsUploadMode(true)}
        >
          Upload File
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium ${
            !isUploadMode
              ? "bg-primary text-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setIsUploadMode(false)}
        >
          Enter URL
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {isUploadMode ? (
        /* File Upload UI */
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.jpg,.jpeg,.png,.webp"
            />
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400 mb-1">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports PDF, Word, Excel, Text, and Images (max 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            className="w-full py-6"
            onClick={handleFileUpload}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload and Start Chat"
            )}
          </Button>
        </div>
      ) : (
        /* URL Input UI */
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm text-gray-400">
              Enter a website URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                className="pl-10 bg-[#1a1a1a] border-gray-700"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter the URL of a website you want to chat about
            </p>
          </div>

          <Button
            className="w-full py-6"
            onClick={handleUrlSubmit}
            disabled={!url.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process URL and Start Chat"
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 