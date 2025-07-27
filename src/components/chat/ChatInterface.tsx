"use client";

import { ChatInterfaceMessages } from "./ChatInterfaceMessage";
import { ChatInterfaceInput } from "./ChatInterfaceInput";
import { ChatInterfaceDocumentViewer } from "./ChatInterfaceDocumentViewer";
import { ChatInterfaceMobileTabs } from "./ChatInterfaceMobileTabs";
import { Loader2 } from "lucide-react";
import { useChatInterface } from "@/hooks/useChatInterface";

/**
 * Renders the main user interface for a chat session.
 *
 * This is a presentational component that orchestrates the chat UI by composing
 * various child components. All business logic, state management, and data
 * fetching are encapsulated within the `useChatInterface` custom hook.
 *
 * @param props The component props.
 * @param props.chatId The unique identifier for the chat session to render.
 * @returns The rendered chat interface component.
 */
const ChatInterface = ({ chatId }: { chatId: string }) => {
  const {
    // State
    inputValue,
    setInputValue,
    showDocument,
    setShowDocument,
    localMessages,
    messagesEndRef,

    // Derived state
    chat,
    file,
    isChatLoading,
    messagesLoading,
    isFileLoading,
    isFileError,
    isSending,

    // Handlers
    handleSendMessage,
    handleKeyPress,
  } = useChatInterface({ chatId });

  // Loading state for initial chat validation
  if (isChatLoading || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chat...</span>
      </div>
    );
  }

  // Error state for when the chat is not found
  if (!isChatLoading && !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">
          Chat not found, redirecting...
        </span>
      </div>
    );
  }

  // Initial loading state for fetching messages
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
            showDocument ? "border-t" : "border-b"
          } border-[#272626]`}
        >
          <ChatInterfaceMobileTabs
            showDocument={showDocument}
            setShowDocument={setShowDocument}
          />
        </div>

        {showDocument ? (
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