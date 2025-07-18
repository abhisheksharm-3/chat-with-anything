import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFiles } from '@/hooks/useFiles';
import { useChats } from '@/hooks/useChats';
import { useUser } from '@/hooks/useUser';
import { TypeFile, TypeChat } from '@/types/supabase';
import { getFileTypeConfig } from '@/constants/FileTypes';
import { getErrorMessage, getUrlType, isValidUrl } from '@/utils/upload-utils';

export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const NAVIGATION_DELAY = 1000; // Increased from 300ms to 1000ms to ensure chat is ready

interface UseUploadLogicProps {
  fileType: string;
  onClose: () => void;
}

export const useUploadLogic = ({ fileType, onClose }: UseUploadLogicProps) => {
  // State
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Hooks
  const router = useRouter();
  const { uploadFileAsync, isUploading, updateFileAsync } = useFiles();
  const { startChatWithFileAsync } = useChats();
  const { isAuthenticated, userId } = useUser();

  // Config
  const fileTypeConfig = getFileTypeConfig(fileType);

  // Reset state
  const resetState = useCallback(() => {
    setUploadStatus('idle');
    setFileName('');
    setUrl('');
    setError('');
    setSelectedFile(null);
  }, []);

  // File handlers
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setUploadStatus('idle');
      setUrl('');
      setError('');
    }
  }, []);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl.trim() && selectedFile) {
      setSelectedFile(null);
      setFileName('');
    }
    
    if (error) setError('');
  }, [selectedFile, error]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileName('');
    setUploadStatus('idle');
  }, []);

  const handleRetry = useCallback(() => {
    setUploadStatus('idle');
    setError('');
  }, []);

  // URL upload logic
  const handleUrlUpload = useCallback(async (): Promise<TypeFile | null> => {
    if (!url.trim()) {
      setUploadStatus('error');
      setError('Please enter a valid URL');
      return null;
    }

    if (!isValidUrl(url)) {
      setUploadStatus('error');
      setError('Please enter a valid URL (e.g., https://example.com)');
      return null;
    }

    try {
      const urlObj = new URL(url);
      const urlType = getUrlType(url, fileType);
      const urlFileName = urlObj.hostname;
      
      // Check if this is a YouTube URL and verify transcript availability
      if (urlType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        console.log("YouTube URL detected, checking transcript availability...");
        
        // Import dynamically to avoid server component issues
        const { checkYoutubeTranscriptAvailability } = await import('@/utils/processors/youtube-utils');
        
        const { available, error } = await checkYoutubeTranscriptAvailability(url);
        
        if (!available) {
          setUploadStatus('error');
          setError(`Cannot process this YouTube video: ${error || 'No transcript available. The video might not have captions, or they might be disabled.'}`);
          return null;
        }
        
        console.log("YouTube transcript is available, proceeding with upload");
      }
      
      console.log(`Creating ${urlType} file entry for URL:`, url);

      const uploadedFile = await uploadFileAsync({
        file: new File([""], urlFileName, { type: "text/plain" }),
        fileData: {
          name: urlFileName,
          type: urlType,
          size: 0
        }
      });
      
      console.log("URL file entry created:", uploadedFile);
      
      if (uploadedFile) {
        console.log("Updating file with URL:", url);
        await updateFileAsync({
          fileId: uploadedFile.id,
          fileData: { url }
        });
        console.log("File updated with URL successfully");
      }
      
      return uploadedFile;
    } catch (err) {
      console.error('URL upload error:', err);
      setUploadStatus('error');
      setError(getErrorMessage(err));
      return null;
    }
  }, [url, fileType, uploadFileAsync, updateFileAsync]);

  // Chat creation with retry
  const createChatWithRetry = useCallback(async (fileId: string): Promise<TypeChat | null> => {
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        console.log(`Chat creation attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
        const newChat = await startChatWithFileAsync(fileId);
        console.log("Chat created successfully:", newChat);
        
        // Verify the chat exists by checking its ID
        if (!newChat?.id) {
          throw new Error("Chat created but ID is missing");
        }
        
        return newChat;
      } catch (retryError) {
        retryCount++;
        console.error(`Chat creation attempt ${retryCount} failed:`, retryError);
        
        if (retryCount <= MAX_RETRIES) {
          console.log(`Retrying chat creation (${retryCount}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw retryError;
        }
      }
    }
    
    return null;
  }, [startChatWithFileAsync]);

  // Main submit handler
  const handleSubmit = useCallback(async () => {
    if (uploadStatus === 'uploaded') {
      onClose();
      return;
    }
    
    // Validation checks
    if (!isAuthenticated || !userId) {
      console.error("Authentication check failed:", { isAuthenticated, userId });
      setUploadStatus('error');
      setError('You must be logged in to upload files');
      return;
    }

    if (fileTypeConfig.comingSoon) {
      setUploadStatus('error');
      setError(`${fileTypeConfig.name} uploads are coming soon. Please check back later.`);
      return;
    }
    
    try {
      setUploadStatus('uploading');
      let uploadedFile: TypeFile | null = null;
      
      console.log("Starting upload with auth:", { isAuthenticated, userId });
      
      if (selectedFile) {
        // File upload
        if (selectedFile.size > fileTypeConfig.maxSize) {
          setUploadStatus('error');
          setError(`File size exceeds ${fileTypeConfig.maxSize / (1024 * 1024)}MB limit`);
          return;
        }
        
        console.log("Uploading file:", selectedFile.name);
        
        uploadedFile = await uploadFileAsync({
          file: selectedFile,
          fileData: {
            name: selectedFile.name,
            type: fileType,
            size: selectedFile.size
          }
        });
        
        console.log("File uploaded successfully:", uploadedFile);
      } else if (url.trim()) {
        // URL upload
        uploadedFile = await handleUrlUpload();
        if (!uploadedFile) {
          return; // Error already set in handleUrlUpload
        }
      } else {
        setUploadStatus('error');
        setError('Please select a file or enter a URL');
        return;
      }
      
      // Verify upload
      if (!uploadedFile?.id) {
        console.error("Invalid uploaded file object:", uploadedFile);
        setUploadStatus('error');
        setError('File upload failed: Invalid response from server');
        return;
      }
      
      // Create chat
      try {
        console.log("Creating chat with userId:", userId, "fileId:", uploadedFile.id);
        
        const newChat = await createChatWithRetry(uploadedFile.id);
        
        if (!newChat?.id) {
          throw new Error("Failed to create chat: No chat ID returned");
        }
        
        setUploadStatus('uploaded');
        onClose();
        
        // Navigate to chat with a delay to ensure everything is ready
        console.log(`Navigating to chat in ${NAVIGATION_DELAY}ms:`, `/chat/${newChat.id}`);
        setTimeout(() => {
          router.push(`/chat/${newChat.id}`);
        }, NAVIGATION_DELAY);
        
      } catch (chatError) {
        console.error("Error creating chat:", chatError);
        setUploadStatus('error');
        setError(`Failed to create chat: ${getErrorMessage(chatError)}`);
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setUploadStatus('error');
      setError(`Upload failed: ${getErrorMessage(uploadError)}`);
    }
  }, [
    uploadStatus,
    isAuthenticated,
    userId,
    selectedFile,
    url,
    fileType,
    fileTypeConfig,
    onClose,
    uploadFileAsync,
    handleUrlUpload,
    createChatWithRetry,
    router
  ]);

  // URL submit handler
  const handleUrlSubmit = useCallback(() => {
    if (url.trim()) {
      handleSubmit();
    }
  }, [url, handleSubmit]);

  // Keyboard handler for URL input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    }
  }, [handleUrlSubmit]);

  return {
    uploadStatus,
    fileName,
    url,
    error,
    selectedFile,
    fileTypeConfig,
    isUploading,
    handleFileChange,
    handleUrlChange,
    handleRemoveFile,
    handleSubmit,
    handleUrlSubmit,
    handleKeyDown,
    handleRetry,
    resetState,
  };
};