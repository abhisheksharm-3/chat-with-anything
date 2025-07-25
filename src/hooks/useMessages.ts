"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeMessage } from "@/types/TypeSupabase";
import { useUser } from "./useUser";
import { sendMessage as sendMessageToGemini } from "@/utils/gemini/actions";
import { ChatMessage } from "@/utils/gemini/client";
import { useMemo, useCallback } from "react";

/** The base query key for all message-related queries in React Query. */
export const MESSAGES_QUERY_KEY = ["messages"];

/**
 * A custom hook for fetching and managing all messages within a specific chat session.
 *
 * It handles fetching the initial message list, provides mutations for sending
 * (which interacts with an AI), creating, updating, and deleting messages, and
 * sets up a real-time subscription to keep the chat updated.
 *
 * @param {string} chatId - The ID of the chat to manage messages for.
 * @returns {object} An object containing message data, loading/error states, mutation functions, and a subscription handler.
 * @property {TypeMessage[]} messages - The array of messages for the chat.
 * @property {boolean} isLoading - True if the initial messages are being fetched.
 * @property {Error | null} error - The error object if fetching fails.
 * @property {(content: string) => void} sendMessage - Mutation function to send a message to the AI and get a response.
 * @property {boolean} isSending - True if the `sendMessage` mutation is pending.
 * @property {(messageData: Omit<TypeMessage, "id" | "created_at">) => void} createMessage - Mutation function to create a message directly in the database.
 * @property {boolean} isCreating - True if the `createMessage` mutation is pending.
 * @property {(params: {messageId: string, messageData: Partial<TypeMessage>}) => void} updateMessage - Mutation function to update a message.
 * @property {boolean} isUpdating - True if the `updateMessage` mutation is pending.
 * @property {(messageId: string) => void} deleteMessage - Mutation function to delete a message.
 * @property {boolean} isDeleting - True if the `deleteMessage` mutation is pending.
 * @property {() => () => void} subscribeToMessages - Function that establishes a real-time subscription and returns an `unsubscribe` function for cleanup.
 */
export const useMessages = (chatId: string) => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { isAuthenticated, userId } = useUser();

  const isValidChatId =
    !!chatId && typeof chatId === "string" && chatId.trim() !== "";

  /** Query to fetch all messages for the specified chat. */
  const messagesQuery = useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, chatId],
    queryFn: async () => {
      if (!isValidChatId) return [];
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return data as TypeMessage[];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: isAuthenticated && isValidChatId,
  });

  // Memoize the messages array to prevent unnecessary re-renders
  const messages = useMemo(() => {
    return messagesQuery.data || [];
  }, [messagesQuery.data]);

  /** Mutation to send a user's message to the AI backend via a server action. */
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!isValidChatId) throw new Error("No chat ID provided");
      if (!userId) throw new Error("No authenticated user");

      // Convert current messages to ChatMessage format for Gemini (excluding temporary ones)
      const currentMessages = (messagesQuery.data || []).filter(
        (msg) => !msg.id.startsWith("temp-") && msg.content !== "...",
      );
      const formattedMessages: ChatMessage[] = currentMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content,
      }));

      // Use retry mechanism for AI calls
      const result = await sendMessageToGemini(
        chatId,
        content,
        formattedMessages,
      );

      // Add a small delay to ensure the server has processed and saved the messages
      await new Promise((resolve) => setTimeout(resolve, 500));

      return result;
    },

    onMutate: async (content: string) => {
      await queryClient.cancelQueries({
        queryKey: [...MESSAGES_QUERY_KEY, chatId],
      });

      const previousMessages = queryClient.getQueryData([
        ...MESSAGES_QUERY_KEY,
        chatId,
      ]) as TypeMessage[] | undefined;

      const tempUserMessage: TypeMessage = {
        id: `temp-user-${Date.now()}`,
        chat_id: chatId,
        role: "user",
        content: content,
        created_at: new Date().toISOString(),
      };

      const tempAiMessage: TypeMessage = {
        id: `temp-ai-${Date.now()}`,
        chat_id: chatId,
        role: "assistant",
        content: "...",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        [...MESSAGES_QUERY_KEY, chatId],
        (oldData: TypeMessage[] | undefined) => {
          const currentData = oldData || [];
          const cleanData = currentData.filter(
            (msg) => !msg.id.startsWith("temp-"),
          );
          return [...cleanData, tempUserMessage, tempAiMessage];
        },
      );

      return { previousMessages, tempAiMessageId: tempAiMessage.id };
    },

    onError: (
      error: Error,
      variables: string,
      context?: { previousMessages?: TypeMessage[]; tempAiMessageId?: string },
    ) => {
      console.error("Send message error:", error);

      // Handle GeminiError specifically
      const errorMessage =
        "Sorry, there was an error processing your request. Please try again.";

      // Create error message
      const errorMessageObj: TypeMessage = {
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: "assistant",
        content: errorMessage,
        created_at: new Date().toISOString(),
      };

      // Update cache with error message
      queryClient.setQueryData(
        [...MESSAGES_QUERY_KEY, chatId],
        (oldData: TypeMessage[] | undefined) => {
          if (!oldData) return [errorMessageObj];

          // Remove temporary AI message and add error message
          const cleanData = oldData.filter(
            (msg) =>
              msg.id !== context?.tempAiMessageId &&
              !msg.id.startsWith("temp-ai-"),
          );
          return [...cleanData, errorMessageObj];
        },
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...MESSAGES_QUERY_KEY, chatId],
        exact: true,
      });
    },

    onSettled: () => {
      queryClient.setQueryData(
        [...MESSAGES_QUERY_KEY, chatId],
        (oldData: TypeMessage[] | undefined) => {
          if (!oldData) return [];
          const cleaned = oldData.filter((msg) => !msg.id.startsWith("temp-"));
          return cleaned;
        },
      );
    },
  });

  /** Mutation to create a message directly in the database, bypassing the AI. */
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: Omit<TypeMessage, "id" | "created_at">) => {
      if (!isValidChatId) throw new Error("No chat ID provided");
      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();
      if (error) throw error;
      return data as TypeMessage;
    },
    onSuccess: (newMessage) => {
      // Optimistically update the cache with the new message.
      queryClient.setQueryData(
        [...MESSAGES_QUERY_KEY, chatId],
        (oldData: TypeMessage[] | undefined) =>
          oldData ? [...oldData, newMessage] : [newMessage],
      );
    },
  });

  /** Mutation to update an existing message in the database. */
  const updateMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      messageData,
    }: {
      messageId: string;
      messageData: Partial<TypeMessage>;
    }) => {
      if (!isValidChatId) throw new Error("No chat ID provided");
      const { data, error } = await supabase
        .from("messages")
        .update(messageData)
        .eq("id", messageId)
        .eq("chat_id", chatId)
        .select()
        .single();
      if (error) throw error;
      return data as TypeMessage;
    },
    onSuccess: (updatedMessage) => {
      // Optimistically update the specific message in the cache.
      queryClient.setQueryData(
        [...MESSAGES_QUERY_KEY, chatId],
        (oldData: TypeMessage[] | undefined) =>
          oldData?.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg,
          ) || [updatedMessage],
      );
    },
  });

  /** Mutation to delete a message from the database. */
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!isValidChatId) throw new Error("No chat ID provided");
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("chat_id", chatId);
      if (error) throw error;
      return messageId;
    },
    onSuccess: (messageId) => {
      // Optimistically remove the deleted message from the cache.
      queryClient.setQueryData(
        [...MESSAGES_QUERY_KEY, chatId],
        (oldData: TypeMessage[] | undefined) =>
          oldData?.filter((msg) => msg.id !== messageId) || [],
      );
    },
  });

  /**
   * Sets up a real-time subscription to the 'messages' table for the current chat.
   * Listens for INSERT, UPDATE, and DELETE events and optimistically updates the
   * React Query cache to keep the UI in sync without full re-fetches.
   *
   * @returns {() => void} An `unsubscribe` function to be called on component cleanup.
   */
  const subscribeToMessages = useCallback(() => {
    if (!isValidChatId || !isAuthenticated) return () => {};

    const channel = supabase.channel(`messages:${chatId}`);

    channel
      .on<TypeMessage>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            [...MESSAGES_QUERY_KEY, chatId],
            (oldData: TypeMessage[] | undefined = []) => {
              if (payload.eventType === "INSERT") {
                const newMessage = payload.new as TypeMessage;
                return oldData.some((msg) => msg.id === newMessage.id)
                  ? oldData
                  : [...oldData, newMessage];
              }
              if (payload.eventType === "UPDATE") {
                const updatedMessage = payload.new as TypeMessage;
                return oldData.map((msg) =>
                  msg.id === updatedMessage.id ? updatedMessage : msg,
                );
              }
              if (payload.eventType === "DELETE") {
                const deletedMessageId = (payload.old as { id: string }).id;
                return oldData.filter((msg) => msg.id !== deletedMessageId);
              }
              return oldData;
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isValidChatId, isAuthenticated, chatId, queryClient, supabase]);

  return {
    // Queries - now using memoized messages
    messages,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    error: messagesQuery.error,

    // Mutations
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,

    createMessage: createMessageMutation.mutate,
    createMessageAsync: createMessageMutation.mutateAsync,
    isCreating: createMessageMutation.isPending,

    updateMessage: updateMessageMutation.mutate,
    updateMessageAsync: updateMessageMutation.mutateAsync,
    isUpdating: updateMessageMutation.isPending,

    deleteMessage: deleteMessageMutation.mutate,
    deleteMessageAsync: deleteMessageMutation.mutateAsync,
    isDeleting: deleteMessageMutation.isPending,

    // Real-time subscription - now memoized with useCallback
    subscribeToMessages,
  };
};