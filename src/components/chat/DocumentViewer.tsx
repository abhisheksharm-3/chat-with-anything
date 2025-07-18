import React from 'react';
import { Loader2, FileText, Image as ImageIcon, Globe, FileSpreadsheet, Presentation } from 'lucide-react';
import Image from 'next/image';
import { TypeFile } from '@/types/supabase';

interface DocumentViewerProps {
  file: TypeFile;
  isLoading: boolean;
  isError: boolean;
  title: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  file, 
  isLoading, 
  isError, 
  title 
}) => {
  const getSourceIcon = () => {
    if (!file) return <FileText size={24} className="text-gray-500" />;
    
    switch (file.type) {
      case 'pdf':
        return <FileText size={24} className="text-red-500" />;
      case 'docs':
      case 'doc':
        return <FileText size={24} className="text-blue-500" />;
      case 'image':
        return <ImageIcon size={24} className="text-green-500" />;
      case 'web':
      case 'youtube':
      case 'url':
        return <Globe size={24} className="text-purple-500" />;
      case 'sheets':
      case 'sheet':
        return <FileSpreadsheet size={24} className="text-green-500" />;
      case 'slides':
        return <Presentation size={24} className="text-orange-500" />;
      default:
        return <FileText size={24} className="text-gray-500" />;
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading document...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-red-900/20 rounded-full p-4 mb-4">
          <FileText size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-red-400">Error loading document</h3>
        <p className="text-sm text-gray-400">Unable to load the document. Please try again.</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-gray-800 rounded-full p-4 mb-4">
          {getSourceIcon()}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-gray-400">No document attached to this chat</p>
      </div>
    );
  }

  // Show processing error
  if (file.processing_status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-red-900/20 rounded-full p-4 mb-4">
          <FileText size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-red-400">Document Processing Error</h3>
        <p className="text-sm text-gray-400 text-center max-w-md">
          {file.processing_error || "Unable to process this document. It might be empty, scanned, or in an unsupported format."}
        </p>
      </div>
    );
  }

  // Show processing status
  if (file.processing_status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-blue-900/20 rounded-full p-4 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-blue-400">Processing Document</h3>
        <p className="text-sm text-gray-400">Please wait while we process your document...</p>
      </div>
    );
  }

  // Handle YouTube or web URL type
  if (file.type === 'web' || file.type === 'youtube' || file.type === 'url') {
    const url = file.url || '';
    
    if (file.type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(url);
      
      if (videoId) {
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-auto">
              <iframe 
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full border-0 rounded-lg"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 overflow-auto">
          <iframe 
            src={url}
            className="w-full h-full border-0 rounded-lg"
            title={`Web content from ${url}`}
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Handle PDF type
  if (file.type === 'pdf') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          {file.url && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
              className="w-full h-full border-0"
              title={`PDF: ${file.name}`}
            />
          )}
        </div>
      </div>
    );
  }

  // Handle Google Docs, Sheets, Slides
  if (['doc', 'docs', 'sheet', 'sheets', 'slides'].includes(file.type || '')) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          {file.url && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
              className="w-full h-full border-0"
              title={`Document: ${file.name}`}
            />
          )}
        </div>
      </div>
    );
  }

  // Handle image type
  if (file.type === 'image') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-4">
          {file.url ? (
            <div className="relative w-full h-full">
              <Image
                src={file.url}
                alt={file.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon size={48} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No image URL available</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default document view
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-full">
        <div className="bg-gray-800 rounded-full p-4 mb-4">
          {getSourceIcon()}
        </div>
        <h3 className="text-lg font-medium ml-2">{file.name}</h3>
      </div>
    </div>
  );
};