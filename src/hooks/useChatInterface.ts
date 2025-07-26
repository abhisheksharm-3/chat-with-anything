"use client";

import { useState, useEffect, useRef } from "react";
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

/**
 * Manages all state and logic for the chat interface.
 *
 * This hook encapsulates data fetching, real-time message synchronization,
 * optimistic UI updates, loading/error states, and event handlers for a given
 * chat session. It returns a comprehensive API for the presentational
 * `ChatInterface` component.
 *
 * @param props The hook's properties.
 * @param props.chatId The unique identifier of the chat to manage.
 * @returns An object containing all the necessary state and handlers for the chat UI.
 */
export const useChatInterface = ({ chatId }: { chatId: string }) => {
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
  const [shouldRedirect, setShouldRedirect] = useState(false);
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

  // --- Effects ---

  // Redirect if chat is not found after a delay.
  useEffect(() => {
    if (!isChatLoading && isChatError) {
      const timer = setTimeout(() => setShouldRedirect(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isChatError, isChatLoading]);

  useEffect(() => {
    if (shouldRedirect) router.push("/not-found");
  }, [shouldRedirect, router]);

  // Synchronize server messages with local optimistic state.
  useEffect(() => {
    if (!serverMessages) return;
    setLocalMessages((currentMessages) =>
      syncMessagesWithOptimisticUpdates(serverMessages, currentMessages)
    );
  }, [serverMessages]);

  // Inject a specific error message if a YouTube video fails processing.
  useEffect(() => {
    const hasYouTubeError = file ? checkYouTubeProcessingError(file) : false;
    if (hasYouTubeError && localMessages.length === 0 && file) {
      const errorMessage = createYouTubeErrorMessage(chatId, file );
      setLocalMessages([errorMessage]);
    }
  }, [file, chatId, localMessages.length]);

  // Subscribe to real-time message updates on mount.
  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, [subscribeToMessages]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // --- Event Handlers ---

  // Handles sending a new message with optimistic UI updates.
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const { tempUserMessage, tempAiMessage } = createOptimisticMessages(
      chatId,
      inputValue
    );

    setLocalMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    const messageToSend = inputValue;
    setInputValue(""); // Clear input immediately

    try {
      await sendMessage(messageToSend);
      // On success, the sync effect will automatically replace temp messages.
    } catch (error) {
      console.error("Failed to send message:", error);
      // On failure, replace the temporary messages with a single error message.
      const errorMessage = createErrorMessage(chatId);
      setLocalMessages((prev) => [
        ...prev.filter(
          (msg) =>
            msg.id !== tempUserMessage.id && msg.id !== tempAiMessage.id
        ),
        errorMessage,
      ]);
    }
  };

  // Handles Enter key press for sending a message.
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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