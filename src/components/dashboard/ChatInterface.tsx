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

  // Combine server messages with local messages
  useEffect(() => {
    if (chatMessages) {
      setLocalMessages(chatMessages);
    }
  }, [chatMessages]);

  // Log for debugging
  useEffect(() => {
    console.log('ChatInterface rendered with:', { 
      chatId, 
      chat: !!chat, 
      fileId: chat?.file_id,
      file: !!file,
      messagesCount: chatMessages?.length 
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

    // Handle YouTube or web URL type
    if (file.type === 'web' || file.type === 'youtube' || file.type === 'url') {
      const url = file.url || '';
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
                      message.content
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
                        message.content
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