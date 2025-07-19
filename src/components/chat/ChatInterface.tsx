"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useMessages, useChats, useFileById } from '@/hooks';
import { TypeMessage } from '@/types/supabase';
import { TypeChatInterfaceProps } from '@/types/chat';
import { ChatInterfaceMessages } from './ChatInterfaceMessage';
import { ChatInterfaceInput } from './ChatInterfaceInput';
import { ChatInterfaceDocumentViewer } from './ChatInterfaceDocumentViewer';
import { ChatInterfaceMobileTabs } from './ChatInterfaceMobileTabs';

/**
 * The main component for the chat interface, orchestrating the document viewer,
 * message display, and user input. It handles data fetching, real-time message
 * updates, and responsive layouts for desktop and mobile.
 *
 * This component manages the lifecycle of a chat session, including:
 * - Fetching initial chat and file data.
 * - Subscribing to real-time messages from Supabase.
 * - Handling optimistic UI updates for sending messages.
 * - Displaying various states (loading, errors, empty).
 * - Toggling between document and chat views on mobile.
 *
 * @component
 * @param {TypeChatInterfaceProps} props - The props for the component.
 * @param {string} [props.title="Untitled Chat"] - The fallback title for the chat, used if a document title is not available.
 * @param {string} props.chatId - The unique identifier for the current chat session.
 * @returns {JSX.Element} The fully interactive chat interface.
 */
const ChatInterface: React.FC<TypeChatInterfaceProps> = ({ 
  title = "Untitled Chat", 
  chatId 
}) => {
  // --- Hooks for data fetching and state management ---
  const { messages: chatMessages, isLoading: messagesLoading, sendMessage, subscribeToMessages } = useMessages(chatId);
  const { getChatById } = useChats();
  const [inputValue, setInputValue] = useState('');
  const [showPDF, setShowPDF] = useState(false); // For mobile view toggle
  const [localMessages, setLocalMessages] = useState<TypeMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localMessagesRef = useRef<TypeMessage[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    localMessagesRef.current = localMessages;
  }, [localMessages]);

  /**
   * Checks if two messages are duplicates based on content and timing
   */
  const areMessagesDuplicate = (msg1: TypeMessage, msg2: TypeMessage): boolean => {
    // Same role and content
    if (msg1.role === msg2.role && msg1.content === msg2.content) {
      // If they're both user messages, they're likely duplicates
      if (msg1.role === 'user') {
        return true;
      }
      
      // For assistant messages, check if they're within a short time window (5 seconds)
      const time1 = new Date(msg1.created_at).getTime();
      const time2 = new Date(msg2.created_at).getTime();
      const timeDiff = Math.abs(time1 - time2);
      return timeDiff < 5000; // 5 seconds
    }
    
    return false;
  };
  
  // Fetch chat and associated file metadata
  const chat = getChatById(chatId);
  const { data: file, isLoading: isFileLoading, isError: isFileError } = useFileById(chat?.file_id || '');

  // Derived state to check for a specific YouTube processing error
  const hasYouTubeProcessingError = file?.type === 'youtube' && 
                                    file?.processing_status === 'failed' && 
                                    file?.processing_error;

  // --- Effects ---

  /**
   * Syncs server-fetched messages (`chatMessages`) with the local display state (`localMessages`).
   * This is designed to prevent infinite re-renders by comparing the states and to preserve
   * temporary optimistic UI messages (like user messages just sent or AI 'thinking' indicators).
   */
  useEffect(() => {
    if (!chatMessages) return;
    
    // Get all temporary messages (optimistic updates)
    const tempMessages = localMessagesRef.current.filter(msg => 
      msg.id.startsWith('temp-') || msg.id.startsWith('error-')
    );
    
    // Get server message IDs to avoid duplicates
    const serverMessageIds = new Set(chatMessages.map(msg => msg.id));
    
    // Filter out temp messages that have been replaced by server messages
    // Also filter out temp user messages that have corresponding server messages with same content
    const uniqueTempMessages = tempMessages.filter(tempMsg => {
      // If it's a temp user message, check if there's a server message with same content
      if (tempMsg.role === 'user' && tempMsg.id.startsWith('temp-')) {
        const hasMatchingServerMessage = chatMessages.some(serverMsg => 
          areMessagesDuplicate(tempMsg, serverMsg)
        );
        return !hasMatchingServerMessage;
      }
      
      // For other temp messages (AI thinking, errors), just check by ID
      return !serverMessageIds.has(tempMsg.id);
    });
    
    // Create new local messages array with server messages + unique temp messages
    const newLocalMessages = [...chatMessages, ...uniqueTempMessages];
    
    // Final deduplication pass to ensure no duplicates exist
    const finalMessages = newLocalMessages.filter((msg, index) => {
      // Check if this message is a duplicate of any previous message
      const isDuplicate = newLocalMessages.slice(0, index).some(prevMsg => 
        areMessagesDuplicate(msg, prevMsg)
      );
      
      return !isDuplicate;
    });
    
    // Only update if the arrays are actually different
    if (JSON.stringify(finalMessages) !== JSON.stringify(localMessagesRef.current)) {
      setLocalMessages(finalMessages);
    }
  }, [chatMessages]);

  /**
   * Injects an error message into the chat if a YouTube video fails processing.
   * This runs only once if the condition is met and the chat is empty.
   */
  useEffect(() => {
    if (hasYouTubeProcessingError && localMessages.length === 0) {
      const errorMessage: TypeMessage = {
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant' as const,
        content: `I couldn't process this YouTube video: ${file?.processing_error || 'No transcript available'}`,
        created_at: new Date().toISOString(),
      };
      setLocalMessages([errorMessage]);
    }
  }, [hasYouTubeProcessingError, file?.processing_error, chatId, localMessages.length]);

  /**
   * Subscribes to real-time message updates from Supabase when the component mounts.
   * Unsubscribes on cleanup to prevent memory leaks.
   */
  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, [subscribeToMessages]);

  /**
   * Automatically scrolls the message list to the bottom whenever new messages are added.
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  // --- Event Handlers ---

  /**
   * Handles sending a new message. It implements an optimistic UI update by
   * immediately adding temporary user and AI "thinking" messages to the state.
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
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
    
    setLocalMessages(prev => [...prev, tempUserMessage, tempAiMessage]);
    const messageToSend = inputValue;
    setInputValue(''); // Clear input immediately
    
    try {
      await sendMessage(messageToSend);
      // Remove the temporary AI message after successful send
      // The temporary user message will be handled by the useEffect when server messages arrive
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempAiMessage.id));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temporary AI message and add error message
      setLocalMessages(prev => {
        const filtered = prev.filter(msg => !msg.id.startsWith('temp-ai-'));
        return [...filtered, {
          id: `error-${Date.now()}`,
          chat_id: chatId,
          role: 'assistant' as const,
          content: 'Sorry, there was an error processing your request. Please try again.',
          created_at: new Date().toISOString(),
        }];
      });
    }
  };

  /**
   * Sends the message when the user presses Enter without the Shift key.
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render Logic ---

  // Initial loading state for the chat
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
      {/* Desktop Layout: 2-column grid */}
      <div className="hidden md:grid grid-cols-2 gap-2 h-full">
        {/* Left Column: Document Viewer */}
        <div className="bg-[#181818] border rounded-xl border-[#272626] flex flex-col">
          {file && (
            <ChatInterfaceDocumentViewer 
              file={file} 
              isLoading={isFileLoading} 
              isError={isFileError} 
              title={title} 
            />
          )}
        </div>

        {/* Right Column: Chat Thread */}
        <div className="bg-[#181818] flex flex-col border border-[#272626] rounded-xl py-2 max-h-[calc(100vh-5rem)]">
          <div className="p-3 border border-[#272626] rounded-xl mx-4">
            <h2 className="text-sm text-center text-gray-400">
              {file ? `// Chat with ${file.name} //` : '// Chat with the document //'}
            </h2>
          </div>
          <ChatInterfaceMessages 
            messages={localMessages}
            messagesLoading={messagesLoading}
            messagesEndRef={messagesEndRef}
          />
          <ChatInterfaceInput 
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      {/* Mobile Layout: Toggable view */}
      <div className="md:hidden flex flex-col h-full">
        <ChatInterfaceMobileTabs showPDF={showPDF} setShowPDF={setShowPDF} />

        {showPDF ? (
          // View 1: Document Viewer
          <div className="flex-1 overflow-hidden">
            {file && (
              <ChatInterfaceDocumentViewer 
                file={file} 
                isLoading={isFileLoading} 
                isError={isFileError} 
                title={title} 
              />
            )}
          </div>
        ) : (
          // View 2: Chat Thread
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <ChatInterfaceMessages 
              messages={localMessages}
              messagesLoading={messagesLoading}
              messagesEndRef={messagesEndRef}
            />
            <ChatInterfaceInput 
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