import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TypeMessage } from "@/types/TypeSupabase";
import { useMessages } from "@/hooks/useMessages";
import { useChats } from "@/hooks/useChats";
import { useFileById } from "@/hooks/useFiles";
import { checkYouTubeProcessingError, createErrorMessage, createOptimisticMessages, createYouTubeErrorMessage, syncMessagesWithOptimisticUpdates } from "@/utils/message-utils";

/**
 * Custom hook that manages the complete chat interface state and logic.
 * Handles message synchronization, optimistic updates, error states, and navigation.
 */
export const useChatInterface = ({ chatId }: { chatId: string }) => {
  const router = useRouter();
  
  // Core hooks
  const {
    messages: chatMessages,
    isLoading: messagesLoading,
    sendMessage,
    subscribeToMessages,
    isSending,
  } = useMessages(chatId);
  
  const { getChatById } = useChats();
  
  // Local state
  const [inputValue, setInputValue] = useState("");
  const [showPDF, setShowPDF] = useState(false);
  const [localMessages, setLocalMessages] = useState<TypeMessage[]>([]);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localMessagesRef = useRef<TypeMessage[]>([]);

  // Derived state
  const chat = getChatById(chatId);
  const {
    data: file,
    isLoading: isFileLoading,
    isError: isFileError,
  } = useFileById(chat?.file_id || "");

  const isChatLoading = !chat && messagesLoading;
  const isChatError = !chat && !messagesLoading;
  const hasYouTubeProcessingError = file ? checkYouTubeProcessingError(file) : false;

  // Keep ref in sync with state
  useEffect(() => {
    localMessagesRef.current = localMessages;
  }, [localMessages]);

  // Handle chat validation and redirect
  useEffect(() => {
    if (!isChatLoading && (isChatError || !chat)) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [chat, isChatLoading, isChatError]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/not-found");
    }
  }, [shouldRedirect, router]);

  // Sync server messages with local state
  useEffect(() => {
    if (!chatMessages) return;

    const newLocalMessages = syncMessagesWithOptimisticUpdates(
      chatMessages,
      localMessagesRef.current
    );

    if (JSON.stringify(newLocalMessages) !== JSON.stringify(localMessagesRef.current)) {
      setLocalMessages(newLocalMessages);
    }
  }, [chatMessages]);

  // Handle YouTube processing errors
  useEffect(() => {
    if (hasYouTubeProcessingError && localMessages.length === 0 && file) {
      const errorMessage = createYouTubeErrorMessage(chatId, file);
      setLocalMessages([errorMessage]);
    }
  }, [hasYouTubeProcessingError, file?.processing_error, chatId, localMessages.length]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, [subscribeToMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  /**
   * Handles sending a new message with optimistic UI updates
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const { tempUserMessage, tempAiMessage } = createOptimisticMessages(
      chatId,
      inputValue
    );

    setLocalMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    const messageToSend = inputValue;
    setInputValue("");

    try {
      await sendMessage(messageToSend);
      // Remove the temporary AI message after successful send
      setLocalMessages((prev) =>
        prev.filter((msg) => msg.id !== tempAiMessage.id)
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = createErrorMessage(chatId);

      setLocalMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.id.startsWith("temp-ai-"));
        return [...filtered, errorMessage];
      });
    }
  };

  /**
   * Handles Enter key press for sending messages
   */
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
  };
};