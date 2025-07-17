"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Upload, MessageSquare, Send, CircleAlert, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFiles } from '@/hooks/useFiles';
import { useChats } from '@/hooks/useChats';
import { useUser } from '@/hooks/useUser';
import { supabaseBrowserClient } from '@/utils/supabase/client';

interface UploadModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  fileType: string;
}

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

const UploadModal = ({ trigger, defaultOpen = false, fileType }: UploadModalProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  
  // Use the React Query hooks
  const { uploadFileAsync, isUploading, updateFileAsync } = useFiles();
  const { startChatWithFileAsync } = useChats();
  const { isAuthenticated } = useUser();

  const handleClose = () => {
    setOpen(false);
    // Reset state when modal is closed
    setTimeout(() => {
      setUploadStatus('idle');
      setFileName('');
      setUrl('');
      setError('');
      setSelectedFile(null);
    }, 300);
  };

  // Function to handle URL uploads
  const handleUrlUpload = async () => {
    if (!url.trim()) {
      setUploadStatus('error');
      setError('Please enter a valid URL');
      return null;
    }

    try {
      // Validate URL format
      let urlObj;
      try {
        urlObj = new URL(url);
        if (!urlObj.protocol.startsWith('http')) {
          throw new Error('URL must start with http:// or https://');
        }
      } catch (err) {
        setUploadStatus('error');
        setError('Please enter a valid URL (e.g., https://example.com)');
        return null;
      }

      // Create a file entry for the URL
      const urlFileName = urlObj.hostname;
      
      const uploadedFile = await uploadFileAsync({
        // We don't need an actual file for URL uploads
        file: new File([""], urlFileName, { type: "text/plain" }),
        fileData: {
          name: urlObj.hostname,
          type: fileType === 'youtube' ? 'youtube' : 'web',
          size: 0,
          is_text_extracted: true,
          context: { sourceUrl: url },
          full_text: null
        }
      });
      
      // After file is created, update it with the URL
      if (uploadedFile) {
        await updateFileAsync({
          fileId: uploadedFile.id,
          fileData: {
            url: url
          }
        });
      }
      
      return uploadedFile;
    } catch (err) {
      console.error('URL upload error:', err);
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to process URL');
      return null;
    }
  };

  const handleSubmit = async () => {
    if (uploadStatus === 'uploaded') {
      handleClose();
      return;
    }
    
    // Check authentication first
    if (!isAuthenticated) {
      setUploadStatus('error');
      setError('You must be logged in to upload files');
      return;
    }
    
    try {
      setUploadStatus('uploading');
      let uploadedFile;
      
      // Verify user authentication before proceeding
      const supabase = supabaseBrowserClient();
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        setUploadStatus('error');
        setError('Authentication error: Your session may have expired. Please log in again.');
        return;
      }
      
      if (selectedFile) {
        // Check file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
          setUploadStatus('error');
          setError('File size exceeds 10MB limit');
          return;
        }
        
        // Upload file using the useFiles hook
        uploadedFile = await uploadFileAsync({
          file: selectedFile,
          fileData: {
            name: selectedFile.name,
            type: selectedFile.type || fileType,
            size: selectedFile.size,
            is_text_extracted: false,
            context: null,
            full_text: null
          }
        });
      } else if (url.trim()) {
        // Handle URL upload
        uploadedFile = await handleUrlUpload();
        if (!uploadedFile) return; // Error already set in handleUrlUpload
      } else {
        setUploadStatus('error');
        setError('Please select a file or enter a URL');
        return;
      }
      
      // Create a new chat for this file using Gemini
      await startChatWithFileAsync(uploadedFile.id);
      
      setUploadStatus('uploaded');
      handleClose();
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      
      // Extract the specific error message
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for specific Supabase errors
        if (errorMessage.includes('new row violates row-level security policy')) {
          errorMessage = 'Permission denied: You do not have permission to upload files. Please check that you are properly logged in.';
        } else if (errorMessage.includes('JWT')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (errorMessage.includes('bucket')) {
          errorMessage = 'Storage error: The file storage system is not properly configured.';
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setFileName(files[0].name);
      setUploadStatus('idle'); // Reset to idle so user can click submit
      // Clear URL input when file is selected
      setUrl('');
      // Clear any previous errors
      setError('');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear file selection when URL is entered
    if (e.target.value.trim() && selectedFile) {
      setSelectedFile(null);
      setFileName('');
    }
    // Clear any previous errors
    if (error) setError('');
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      handleSubmit();
    }
  };

  // Check authentication status
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#121212] border border-[#333] max-w-md p-0 rounded-xl" showCloseButton={false}>
        <div className="p-4 flex justify-between items-start border-b border-[#333]">
          <div>
            <h2 className="text-base font-medium">Upload and attach files</h2>
            <p className="text-xs text-gray-400 mt-0.5">Upload and attach files to this project.</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          {uploadStatus === 'idle' && (
            <div className="border border-dashed border-[#333] rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <p className="text-sm">
                  <span className="text-primary hover:text-primary/90 cursor-pointer">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or PDF (max. 10 MB)</p>
              </label>
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-300">Selected: {selectedFile.name}</div>
              )}
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="border border-dashed border-[#333] rounded-lg p-6 text-center mb-4 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-400">Upload in progress</p>
            </div>
          )}

          {uploadStatus === 'uploaded' && (
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
                  onClick={() => {
                    setSelectedFile(null);
                    setFileName('');
                    setUploadStatus('idle');
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="border border-dashed border-red-500 rounded-lg p-6 text-center mb-4">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="text-red-500 h-5 w-5 mr-2" />
                <p className="text-sm text-red-500 font-medium">Upload Failed</p>
              </div>
              <p className="text-sm text-red-400">{error || 'An error occurred during upload'}</p>
              <button
                className="mt-3 text-primary hover:text-primary/90 text-sm"
                onClick={() => setUploadStatus('idle')}
              >
                Try again
              </button>
            </div>
          )}

          {/* OR divider with horizontal lines */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-grow h-px bg-[#333]"></div>
            <div className="mx-4 text-sm text-gray-400">OR</div>
            <div className="flex-grow h-px bg-[#333]"></div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Import from URL</p>
            <div className="relative">
              <input
                type="text"
                placeholder="https://"
                value={url}
                onChange={handleUrlChange}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
              <button 
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${url.trim() ? 'text-white' : 'text-gray-400'} hover:text-white`}
                onClick={handleUrlSubmit}
                disabled={!url.trim() || isUploading}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center mb-2 gap-2 bg-[#181818] p-3 rounded-xl">
              <CircleAlert size={16} className="text-primary" />
            <p className="text-sm font-medium text-primary">Please make sure the link can be accessed directly</p>
          </div>
        </div>

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
            disabled={uploadStatus === 'uploading' || isUploading || (!selectedFile && !url.trim())}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal; 