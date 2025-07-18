"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CircleAlert, AlertCircle } from 'lucide-react';
import { useUploadLogic } from '@/hooks/useUpload';
import { getFileTypeConfig } from '@/constants/FileTypes';
import { useUser } from '@/hooks/useUser';

// Components
import UploadArea from '../upload/UploadArea';
import UploadProgress from '../upload/UploadProgress';
import UploadSuccess from '../upload/UploadSuccess';
import UploadError from '../upload/UploadError';
import UrlInput from '../upload/UrlInput';

// Types
interface UploadModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  fileType: string;
}

// Component
const UploadModal: React.FC<UploadModalProps> = ({ 
  trigger, 
  defaultOpen = false, 
  fileType 
}) => {
  // State
  const [open, setOpen] = useState(defaultOpen);
  
  // Hooks
  const { isAuthenticated } = useUser();
  const fileTypeConfig = getFileTypeConfig(fileType);
  const isComingSoon = fileTypeConfig.comingSoon === true;
  const isUrlOnly = fileTypeConfig.urlOnly === true;

  // Close handler with state reset
  const handleClose = () => {
    setOpen(false);
  };
  
  // Upload logic
  const {
    uploadStatus,
    fileName,
    url,
    error,
    selectedFile,
    handleFileChange,
    handleUrlChange,
    handleRemoveFile,
    handleRetry,
    handleSubmit,
    handleUrlSubmit,
    handleKeyDown,
    isUploading
  } = useUploadLogic({ 
    fileType, 
    onClose: handleClose 
  });

  // Render guards
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="bg-[#121212] border border-[#333] max-w-md p-0 rounded-xl" showCloseButton={false}>
          <div className="p-6 flex flex-col items-center justify-center">
            <AlertCircle className="text-red-500 h-12 w-12 mb-4" />
            <h2 className="text-lg font-medium mb-2">Authentication Required</h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              You need to be logged in to upload files and start chats.
            </p>
            <Button 
              onClick={handleClose}
              className="w-full py-2 text-center bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isComingSoon) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="bg-[#121212] border border-[#333] max-w-md p-0 rounded-xl" showCloseButton={false}>
          <div className="p-6 flex flex-col items-center justify-center">
            <CircleAlert className="text-amber-500 h-12 w-12 mb-4" />
            <h2 className="text-lg font-medium mb-2">Coming Soon</h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              {fileTypeConfig.name} uploads are coming soon. We&apos;re working hard to bring this feature to you!
            </p>
            <Button 
              onClick={handleClose}
              className="w-full py-2 text-center bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main render
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#121212] border border-[#333] max-w-md p-0 rounded-xl" showCloseButton={false}>
        {/* Header */}
        <div className="p-4 flex justify-between items-start border-b border-[#333]">
          <div>
            <h2 className="text-base font-medium">Upload {fileTypeConfig.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Upload and chat with your {fileTypeConfig.name.toLowerCase()}.
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* File upload area */}
          {!isUrlOnly && uploadStatus === 'idle' && (
            <UploadArea 
              fileTypeConfig={fileTypeConfig}
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
            />
          )}

          {/* Upload states */}
          {uploadStatus === 'uploading' && <UploadProgress />}
          {uploadStatus === 'uploaded' && (
            <UploadSuccess fileName={fileName} handleRemoveFile={handleRemoveFile} />
          )}
          {uploadStatus === 'error' && (
            <UploadError error={error} handleRetry={handleRetry} />
          )}

          {/* OR divider */}
          {!isUrlOnly && (
            <div className="flex items-center justify-center my-4">
              <div className="flex-grow h-px bg-[#333]"></div>
              <div className="mx-4 text-sm text-gray-400">OR</div>
              <div className="flex-grow h-px bg-[#333]"></div>
            </div>
          )}

          {/* URL input */}
          <UrlInput
            url={url}
            fileTypeConfig={fileTypeConfig}
            isUrlOnly={isUrlOnly}
            handleUrlChange={handleUrlChange}
            handleUrlSubmit={handleUrlSubmit}
            handleKeyDown={handleKeyDown}
            isUploading={isUploading}
          />

          {/* Info message */}
          <div className="flex items-center mb-2 gap-2 bg-[#181818] p-3 rounded-xl">
            <CircleAlert size={16} className="text-primary" />
            <p className="text-sm font-medium text-primary">
              Please make sure the link can be accessed directly
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex border-t border-[#333] p-4">
          <Button
            onClick={handleClose}
            className="flex-1 py-2 text-center bg-transparent hover:bg-[#1a1a1a] text-gray-400 rounded-lg mr-2 cursor-pointer"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 py-2 text-center bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer"
            disabled={isUploading || (uploadStatus !== 'idle' && uploadStatus !== 'error')}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;