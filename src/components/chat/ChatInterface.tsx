// src/components/chat/ChatInterface.tsx

"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useChatInterface } from "@/hooks/useChatInterface";

import { ChatInterfaceInput } from "./ChatInterfaceInput";
import { ChatInterfaceDocumentViewer } from "./ChatInterfaceDocumentViewer";
import { ChatInterfaceMessages } from "./ChatInterfaceMessage";

/**
 * Renders a beautiful and responsive "glass" interface for a chat session.
 * Features a resizable split-screen on desktop and a tabbed view on mobile.
 */
const ChatInterface = ({ chatId }: { chatId: string }) => {
  const {
    inputValue,
    setInputValue,
    localMessages,
    messagesEndRef,
    chat,
    file,
    isChatLoading,
    messagesLoading,
    isFileLoading,
    isFileError,
    isSending,
    handleSendMessage,
    handleKeyPress,
  } = useChatInterface({ chatId });

  if (isChatLoading || !chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>Loading Chat...</span>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Layout: Resizable Glass Panels */}
      <div className="hidden h-full md:block">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={30}>
            {file && (
              <ChatInterfaceDocumentViewer
                file={file}
                isLoading={isFileLoading}
                isError={isFileError}
                title={chat.title || "Document"}
              />
            )}
            {!file && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span>No document available</span>
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md">
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
                isSending={isSending}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout: Themed Tabs */}
      <div className="flex h-full flex-col md:hidden">
        <Tabs defaultValue="chat" className="flex h-full w-full flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-grow">
            <div className="flex h-full flex-col rounded-b-lg border border-border bg-card">
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
                isSending={isSending}
              />
            </div>
          </TabsContent>
          <TabsContent value="document" className="flex-grow">
            {file && (
              <ChatInterfaceDocumentViewer
                file={file}
                isLoading={isFileLoading}
                isError={isFileError}
                title={chat.title || "Document"}
              />
            )}
            {!file && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span>No document available</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ChatInterface;