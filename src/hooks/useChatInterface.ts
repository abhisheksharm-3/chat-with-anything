"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TypeMessage } from "@/types/TypeSupabase";
import { useMessages } from "@/hooks/useMessages";
import { useChats } from "@/hooks/useChats";
import { useFileById } from "@/hooks/useFiles";
import {
  checkYouTubeProcessingError,
  createErrorMessage,
  createOptimisticMessages,
  createYouTubeErrorMessage,
  syncMessagesWithOptimisticUpdates,
} from "@/utils/message-utils";
import { TypeUseChatInterfaceProps, TypeUseChatInterfaceReturn } from "@/types/TypeChat";

const RedirectDelay = 2000;

/**
 * Manages all state and logic for the chat interface.
 *
 * This hook encapsulates data fetching, real-time message synchronization,
 * optimistic UI updates, loading/error states, and event handlers for a given
 * chat session. It returns a comprehensive API for the presentational
 * `ChatInterface` component.
 */
export const useChatInterface = ({ chatId }: TypeUseChatInterfaceProps): TypeUseChatInterfaceReturn => {
  const router = useRouter();

  // --- Core Hooks ---
  const {
    messages: serverMessages,
    isLoading: messagesLoading,
    isSending,
    sendMessage,
    subscribeToMessages,
  } = useMessages(chatId);
  const { getChatById } = useChats();

  // --- Local State ---
  const [inputValue, setInputValue] = useState("");
  const [showDocument, setShowDocument] = useState(false);
  const [localMessages, setLocalMessages] = useState<TypeMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  const chat = getChatById(chatId);
  const {
    data: file,
    isLoading: isFileLoading,
    isError: isFileError,
  } = useFileById(chat?.file_id || "");

  const isChatLoading = !chat && messagesLoading;
  const isChatError = !chat && !messagesLoading;

  // --- Memoized Handlers ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSending) return;

    const { tempUserMessage, tempAiMessage } = createOptimisticMessages(
      chatId,
      trimmedInput
    );

    // Update UI optimistically
    setLocalMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    setInputValue(""); // Clear input immediately

    try {
      await sendMessage(trimmedInput);
      // Success: sync effect will automatically replace temp messages
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Replace temporary messages with error message
      const errorMessage = createErrorMessage(chatId);
      setLocalMessages((prev) => 
        prev
          .filter((msg) => 
            msg.id !== tempUserMessage.id && msg.id !== tempAiMessage.id
          )
          .concat(errorMessage)
      );
    }
  }, [inputValue, isSending, chatId, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // --- Effects ---

  // Handle chat not found with redirect
  useEffect(() => {
    if (!isChatLoading && isChatError) {
      const timer = setTimeout(() => {
        router.push("/not-found");
      }, RedirectDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isChatError, isChatLoading, router]);

  // Synchronize server messages with local optimistic state
  useEffect(() => {
    if (serverMessages) {
      setLocalMessages((currentMessages) =>
        syncMessagesWithOptimisticUpdates(serverMessages, currentMessages)
      );
    }
  }, [serverMessages]);

  // Handle YouTube processing errors
  useEffect(() => {
    if (!file || localMessages.length > 0) return;

    const hasYouTubeError = checkYouTubeProcessingError(file);
    if (hasYouTubeError) {
      const errorMessage = createYouTubeErrorMessage(chatId, file);
      setLocalMessages([errorMessage]);
    }
  }, [file, chatId, localMessages.length]);

  // Subscribe to real-time message updates
  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, [subscribeToMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  return {
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
    isChatError,
    messagesLoading,
    isFileLoading,
    isFileError,
    isSending,

    // Handlers
    handleSendMessage,
    handleKeyPress,
  };
};