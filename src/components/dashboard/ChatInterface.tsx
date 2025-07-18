"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, FileText, Image as ImageIcon, Globe, FileSpreadsheet, Presentation } from 'lucide-react';
import Image from 'next/image';
import { useMessages, useChats, useFileById } from '@/hooks';

interface ChatInterfaceProps {
  title: string;
  chatId: string;
  source?: string; // Optional, used for document type
}

const ChatInterface = ({ title = "Untitled Chat", chatId }: ChatInterfaceProps) => {
  const { messages: chatMessages, isLoading: messagesLoading, sendMessage, isSending, subscribeToMessages, createMessage } = useMessages(chatId);
  const { getChatById, isChatLoading } = useChats();
  const [inputValue, setInputValue] = useState('');
  const [showPDF, setShowPDF] = useState(false); // For mobile view: false = show chat, true = show document
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  
  // Get chat data - getChatById returns the chat object directly, not wrapped in { data }
  const chat = getChatById(chatId);
  
  // Get file data if chat has a file_id - using the new hook structure
  const { data: file, isLoading: isFileLoading, isError: isFileError } = useFileById(chat?.file_id || '');

  // Check if this is a YouTube video that failed processing
  const hasYouTubeProcessingError = file?.type === 'youtube' && 
                                   file?.processing_status === 'failed' && 
                                   file?.processing_error;

  // Combine server messages with local messages
  useEffect(() => {
    if (chatMessages) {
      setLocalMessages(chatMessages);
    }
  }, [chatMessages]);

  // Add an error message for YouTube processing failures
  useEffect(() => {
    if (hasYouTubeProcessingError && localMessages.length === 0) {
      // Add a system message about the YouTube transcript issue
      setLocalMessages([{
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant',
        content: `I couldn't process this YouTube video: ${file?.processing_error || 'No transcript available'}`,
        created_at: new Date().toISOString(),
        isError: true,
      }]);
    }
  }, [hasYouTubeProcessingError, file?.processing_error, chatId, localMessages.length]);

  // Log for debugging
  useEffect(() => {
    console.log('ChatInterface rendered with:', { 
      chatId, 
      chat: !!chat, 
      fileId: chat?.file_id,
      file: !!file,
      messagesCount: chatMessages?.length,
      processingStatus: file?.processing_status,
      processingError: file?.processing_error
    });
  }, [chatId, chat, file, chatMessages]);

  // Get source icon based on file type
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

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, [subscribeToMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      // Add message to local state immediately
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        role: 'user',
        content: inputValue,
        created_at: new Date().toISOString(),
      };
      
      setLocalMessages(prev => [...prev, tempUserMessage]);
      
      // Add AI thinking message
      const tempAiMessage = {
        id: `temp-ai-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant',
        content: '...',
        created_at: new Date().toISOString(),
        isLoading: true,
      };
      
      setLocalMessages(prev => [...prev, tempAiMessage]);
      
      // Clear input immediately
      setInputValue('');
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Use the Gemini-integrated sendMessage function
      await sendMessage(inputValue);
      
      // The real messages will be updated via the subscription
      // Remove the temporary AI message after the real one arrives
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempAiMessage.id));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary AI message on error
      setLocalMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-ai-')));
      
      // Add error message
      setLocalMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        created_at: new Date().toISOString(),
        isError: true,
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to render message content with YouTube embeds
  const renderMessageContent = (content: string) => {
    // Check if the content is an error message about YouTube transcripts
    if (content.startsWith("I couldn't process this YouTube video:") || 
        content.startsWith("ERROR: No transcript available for this YouTube video")) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">
            This video doesn't have available captions or transcripts. Please try a different video 
            that has manually added captions. Videos with auto-generated captions may not work.
          </p>
        </div>
      );
    }
    
    // Check if the content is an error message about document processing
    if (content.startsWith("I couldn't process this document:")) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">The document might be empty, scanned, or in an unsupported format.</p>
        </div>
      );
    }
    
    // Check if the content contains a YouTube video ID pattern
    const youtubeRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/g;
    let match;
    let lastIndex = 0;
    const parts = [];
    
    // Find all YouTube links in the content
    while ((match = youtubeRegex.exec(content)) !== null) {
      // Add the text before the match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Extract the video ID
      const videoId = match[1] || match[2];
      
      // Add the YouTube embed
      parts.push(
        <div key={`youtube-${match.index}`} className="my-2 w-full">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`}
            width="100%"
            height="315"
            frameBorder="0"
            allowFullScreen
            title={`YouTube Video ${videoId}`}
            className="rounded-lg"
          />
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add the remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    // If no YouTube links were found, just return the content
    if (parts.length === 0) {
      return content;
    }
    
    return <>{parts}</>;
  };

  // Render document content based on type
  const renderDocumentContent = () => {
    if (isFileLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-400">Loading document...</span>
        </div>
      );
    }

    if (isFileError) {
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

    // Show processing error if document failed to process
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

    // Show processing status if document is still processing
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
      
      // Special handling for YouTube videos
      if (file.type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        // Extract video ID from YouTube URL
        const getYouTubeVideoId = (url: string): string | null => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          return (match && match[2].length === 11) ? match[2] : null;
        };
        
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
      
      // Default handling for other web content
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

    // Handle Google Docs type
    if (file.type === 'doc' || file.type === 'docs') {
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

    // Handle Google Sheets type
    if (file.type === 'sheet' || file.type === 'sheets') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            {file.url && (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                className="w-full h-full border-0"
                title={`Spreadsheet: ${file.name}`}
              />
            )}
          </div>
        </div>
      );
    }

    // Handle Google Slides type
    if (file.type === 'slides') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            {file.url && (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                className="w-full h-full border-0"
                title={`Presentation: ${file.name}`}
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

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-2 gap-2 h-full">
        {/* Left Panel - Document Viewer */}
        <div className="bg-[#181818] border rounded-xl border-[#333] flex flex-col">
          {renderDocumentContent()}
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="bg-[#181818] flex flex-col border rounded-xl px-4 py-2 max-h-[calc(100vh-5rem)]">
          <div className="p-3 border border-[#333] rounded-xl">
            <h2 className="text-sm text-center text-gray-400">
              {file ? `// Chat with ${file.name} //` : '// Chat with the document //'}
            </h2>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading && localMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-400">Loading messages...</span>
              </div>
            ) : localMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm text-center">
                  No messages yet. Start chatting with the document!
                </p>
              </div>
            ) : (
              localMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.isError 
                          ? "bg-red-900/20 text-red-400" 
                          : "bg-[#2a2a2a] text-foreground"
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>AI is thinking...</span>
                      </div>
                    ) : (
                      renderMessageContent(message.content)
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#333] bg-[#181818]">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="absolute right-2 bottom-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile Tabs */}
        <div className="flex border-b border-[#333] sticky top-0 bg-[#121212] z-10">
          <button
            className={`flex-1 py-2 text-center text-sm border-b-2 ${
              !showPDF
                ? "border-primary text-white"
                : "border-transparent text-gray-400"
            }`}
            onClick={() => setShowPDF(false)}
          >
            Chat
          </button>
          <button
            className={`flex-1 py-2 text-center text-sm border-b-2 ${
              showPDF
                ? "border-primary text-white"
                : "border-transparent text-gray-400"
            }`}
            onClick={() => setShowPDF(true)}
          >
            Document
          </button>
        </div>

        {/* Mobile Content */}
        {showPDF ? (
          <div className="flex-1 overflow-hidden">
            {renderDocumentContent()}
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && localMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-gray-400">Loading messages...</span>
                </div>
              ) : localMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm text-center">
                    No messages yet. Start chatting with the document!
                  </p>
                </div>
              ) : (
                localMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.isError 
                            ? "bg-red-900/20 text-red-400" 
                            : "bg-[#2a2a2a] text-foreground"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>AI is thinking...</span>
                        </div>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#333] bg-[#121212] sticky bottom-0">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatInterface;