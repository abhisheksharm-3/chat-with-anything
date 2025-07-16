"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Upload, MessageSquare, Send, CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UploadModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  fileType: string;
}

type UploadStatus = 'idle' | 'uploading' | 'uploaded';

const UploadModal = ({ trigger, defaultOpen = false, fileType }: UploadModalProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    // Reset state when modal is closed
    setTimeout(() => {
      setUploadStatus('idle');
      setFileName('');
      setUrl('');
    }, 300);
  };

  const handleSubmit = () => {
    if (uploadStatus === 'uploaded') {
      // If already uploaded, redirect to chat page
      router.push(`/chat/${fileType}`);
      handleClose();
      return;
    }
    
    // Simulate file upload
    if (url.trim()) {
      // Simulate URL upload
      setUploadStatus('uploading');
      setTimeout(() => {
        setUploadStatus('uploaded');
        setFileName('My_Journey.pdf');
      }, 1500);
    } else {
      // For demo purposes, show upload progress anyway
      setUploadStatus('uploading');
      setTimeout(() => {
        setUploadStatus('uploaded');
        setFileName('My_Journey.pdf');
      }, 1500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadStatus('uploading');
      setTimeout(() => {
        setUploadStatus('uploaded');
        setFileName(files[0].name);
      }, 1500);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

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
                <button className="text-primary hover:text-primary/90 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
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
              />
              <button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${url.trim() ? 'text-white' : 'text-gray-400'} hover:text-white`}>
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
            disabled={uploadStatus === 'uploading'}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal; 