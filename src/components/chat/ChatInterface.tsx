"use client";

import React from "react";
import { ChatInterfaceMessages } from "./ChatInterfaceMessage";
import { ChatInterfaceInput } from "./ChatInterfaceInput";
import { ChatInterfaceDocumentViewer } from "./ChatInterfaceDocumentViewer";
import { ChatInterfaceMobileTabs } from "./ChatInterfaceMobileTabs";
import { Loader2 } from "lucide-react";
import { useChatInterface } from "@/hooks/useChatInterface";

interface ChatInterfaceProps {
  chatId: string;
}

/**
 * The main component for the chat interface, orchestrating the document viewer,
 * message display, and user input. It handles data fetching, real-time message
 * updates, and responsive layouts for desktop and mobile.
 *
 * This component has been refactored to use the useChatInterface hook for state
 * management and the messageUtils for complex message handling logic.
 *
 * @component
 * @param {ChatInterfaceProps} props - The props for the component.
 * @param {string} props.chatId - The unique identifier for the current chat session.
 * @returns {JSX.Element} The fully interactive chat interface.
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  const {
    // State
    inputValue,
    setInputValue,
    showPDF,
    setShowPDF,
    localMessages,
    messagesEndRef,
    
    // Derived state
    chat,
    file,
    isChatLoading,
    isChatError,
    messagesLoading,
    isFileLoading,
    isFileError,
    isSending,
    
    // Handlers
    handleSendMessage,
    handleKeyPress,
  } = useChatInterface({ chatId });

  // Loading state for chat validation
  if (isChatLoading || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chat...</span>
      </div>
    );
  }

  // Error state - chat not found
  if (isChatError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">
          Chat not found, redirecting...
        </span>
      </div>
    );
  }

  // Initial loading state for messages
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
              title={chat.title || "Untitled Chat"}
            />
          )}
        </div>

        {/* Right Column: Chat Thread */}
        <div className="bg-[#181818] flex flex-col border border-[#272626] rounded-xl py-2 max-h-[calc(100vh-5rem)]">
          <div className="p-3 border border-[#272626] rounded-xl mx-4">
            <h2 className="text-sm text-center text-gray-400">
              {file
                ? `// Chat with ${file.name} //`
                : "// Chat with the document //"}
            </h2>
          </div>
          <ChatInterfaceMessages
            messages={localMessages}
            messagesLoading={messagesLoading}
            messagesEndRef={messagesEndRef}
            isSending={isSending}
          />
          <ChatInterfaceInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      {/* Mobile Layout: Toggleable view */}
      <div className="md:hidden flex flex-col h-full">
        <div
          className={`flex items-center justify-between p-4 bg-[#121212] ${
            showPDF ? "border-t" : "border-b"
          } border-[#272626]`}
        >
          <ChatInterfaceMobileTabs showPDF={showPDF} setShowPDF={setShowPDF} />
        </div>

        {showPDF ? (
          // View 1: Document Viewer
          <div className="flex-1 overflow-hidden">
            {file && (
              <ChatInterfaceDocumentViewer
                file={file}
                isLoading={isFileLoading}
                isError={isFileError}
                title={chat.title || "Untitled Chat"}
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