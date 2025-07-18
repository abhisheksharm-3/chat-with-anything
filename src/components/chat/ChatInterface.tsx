"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useMessages, useChats, useFileById } from '@/hooks';
import { TypeMessage } from '@/types/supabase';
import { TypeChatInterfaceProps } from '@/types/chat';
import { ChatMessages } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { DocumentViewer } from './DocumentViewer';
import { MobileTabs } from './MobileTabs';

const ChatInterface: React.FC<TypeChatInterfaceProps> = ({ 
  title = "Untitled Chat", 
  chatId 
}) => {
  const { messages: chatMessages, isLoading: messagesLoading, sendMessage, subscribeToMessages } = useMessages(chatId);
  const { getChatById } = useChats();
  const [inputValue, setInputValue] = useState('');
  const [showPDF, setShowPDF] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<TypeMessage[]>([]);
  
  const chat = getChatById(chatId);
  const { data: file, isLoading: isFileLoading, isError: isFileError } = useFileById(chat?.file_id || '');

  const hasYouTubeProcessingError = file?.type === 'youtube' && 
                                   file?.processing_status === 'failed' && 
                                   file?.processing_error;

  // Combine server messages with local messages - fixed to prevent infinite loop
  useEffect(() => {
    // Only update if chatMessages is different from localMessages
    // This prevents infinite loops when setting state in useEffect
    if (chatMessages && JSON.stringify(chatMessages) !== JSON.stringify(localMessages)) {
      // Filter out any temporary messages
      const filteredMessages = localMessages.filter(msg => 
        msg.id.startsWith('temp-') || msg.id.startsWith('error-')
      );
      
      if (filteredMessages.length > 0) {
        // If we have temporary messages, keep them and add the server messages
        const serverMessageIds = chatMessages.map(msg => msg.id);
        const uniqueTempMessages = filteredMessages.filter(
          msg => !serverMessageIds.includes(msg.id)
        );
        
        setLocalMessages([...chatMessages, ...uniqueTempMessages]);
      } else {
        // If no temporary messages, just use the server messages
        setLocalMessages(chatMessages);
      }
    }
  }, [chatMessages]);

  // Add error message for YouTube processing failures
  useEffect(() => {
    if (hasYouTubeProcessingError && localMessages.length === 0) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant' as const,
        content: `I couldn't process this YouTube video: ${file?.processing_error || 'No transcript available'}`,
        created_at: new Date().toISOString(),
      };
      
      setLocalMessages([errorMessage]);
    }
  }, [hasYouTubeProcessingError, file?.processing_error, chatId, localMessages.length]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, [subscribeToMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      const tempUserMessage: TypeMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        role: "user",
        content: inputValue,
        created_at: new Date().toISOString(),
      };
      
      const tempAiMessage: TypeMessage = {
        id: `temp-ai-${Date.now()}`,
        chat_id: chatId,
        role: "assistant",
        content: '...',
        created_at: new Date().toISOString(),
      };
      
      // Update state once with both messages
      setLocalMessages(prev => [...prev, tempUserMessage, tempAiMessage]);
      
      // Clear input immediately
      setInputValue('');
      
      // Send the message
      await sendMessage(inputValue);
      
      // Remove the temporary AI message after the real one arrives
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempAiMessage.id));
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove any temporary AI messages
      setLocalMessages(prev => {
        const filtered = prev.filter(msg => !msg.id.startsWith('temp-ai-'));
        
        // Add error message
        return [...filtered, {
          id: `error-${Date.now()}`,
          chat_id: chatId,
          role: 'assistant' as const,
          content: 'Sorry, there was an error processing your request.',
          created_at: new Date().toISOString(),
          isError: true,
        }];
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state if we're still loading messages
  if (messagesLoading && !localMessages.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-2 gap-2 h-full">
        <div className="bg-[#181818] border rounded-xl border-[#333] flex flex-col">
          {file && (
            <DocumentViewer 
              file={file} 
              isLoading={isFileLoading} 
              isError={isFileError} 
              title={title} 
            />
          )}
        </div>

        <div className="bg-[#181818] flex flex-col border rounded-xl px-4 py-2 max-h-[calc(100vh-5rem)]">
          <div className="p-3 border border-[#333] rounded-xl">
            <h2 className="text-sm text-center text-gray-400">
              {file ? `// Chat with ${file.name} //` : '// Chat with the document //'}
            </h2>
          </div>

          <ChatMessages 
            messages={localMessages}
            messagesLoading={messagesLoading}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput 
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        <MobileTabs showPDF={showPDF} setShowPDF={setShowPDF} />

        {showPDF ? (
          <div className="flex-1 overflow-hidden">
            {file && (
              <DocumentViewer 
                file={file} 
                isLoading={isFileLoading} 
                isError={isFileError} 
                title={title} 
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <ChatMessages 
              messages={localMessages}
              messagesLoading={messagesLoading}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput 
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              className="p-4 border-t border-[#333] bg-[#121212] sticky bottom-0"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ChatInterface;