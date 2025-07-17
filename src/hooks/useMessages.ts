"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeMessage } from "@/types/supabase";
import { useUser } from "./useUser";
import { sendMessage as sendMessageToGemini } from "@/utils/gemini/actions";

// Define query keys as constants
export const MESSAGES_QUERY_KEY = ["messages"];

/**
 * Custom hook to fetch and manage messages for a specific chat
 */
export function useMessages(chatId: string) {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { isAuthenticated } = useUser();

  // Ensure chatId is valid
  const isValidChatId = !!chatId && typeof chatId === 'string' && chatId.trim() !== '';

  // Fetch all messages for a specific chat
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

        if (error) {
          console.error("Error fetching messages:", error);
          return [];
        }
        
        return data as TypeMessage[];
      } catch (error) {
        console.error("Error in messages query:", error);
        return [];
      }
    },
    enabled: isAuthenticated && isValidChatId,
  });

  // Send message using Gemini API
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!isValidChatId) {
        throw new Error("No chat ID provided");
      }

      try {
        // Use the server action to send message to Gemini
        const result = await sendMessageToGemini(chatId, content);
        return result;
      } catch (error) {
        console.error("Error sending message to Gemini:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, chatId] });
    },
  });

  // Create a new message (local only, without Gemini)
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: Omit<TypeMessage, "id" | "created_at">) => {
      if (!isValidChatId) {
        throw new Error("No chat ID provided");
      }

      const newMessage = {
        ...messageData,
        chat_id: chatId,
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;
      return data as TypeMessage;
    },
    onSuccess: (newMessage) => {
      // Update the messages list in the cache
      queryClient.setQueryData([...MESSAGES_QUERY_KEY, chatId], (oldData: TypeMessage[] | undefined) => {
        return oldData ? [...oldData, newMessage] : [newMessage];
      });
    },
  });

  // Update an existing message
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, messageData }: { messageId: string; messageData: Partial<TypeMessage> }) => {
      if (!isValidChatId) {
        throw new Error("No chat ID provided");
      }

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
      // Update the message in the messages list
      queryClient.setQueryData([...MESSAGES_QUERY_KEY, chatId], (oldData: TypeMessage[] | undefined) => {
        if (!oldData) return [updatedMessage];
        return oldData.map((message) => (message.id === updatedMessage.id ? updatedMessage : message));
      });
    },
  });

  // Delete a message
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!isValidChatId) {
        throw new Error("No chat ID provided");
      }

      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("chat_id", chatId);

      if (error) throw error;
      return messageId;
    },
    onSuccess: (messageId) => {
      // Update the messages list in the cache
      queryClient.setQueryData([...MESSAGES_QUERY_KEY, chatId], (oldData: TypeMessage[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((message) => message.id !== messageId);
      });
    },
  });

  // Set up real-time subscription for new messages
  const subscribeToMessages = () => {
    if (!isValidChatId || !isAuthenticated) return () => {};

    try {
      const subscription = supabase
        .channel(`messages:${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as TypeMessage;
              
              // Check if the message is already in the cache to avoid duplicates
              queryClient.setQueryData([...MESSAGES_QUERY_KEY, chatId], (oldData: TypeMessage[] | undefined) => {
                if (!oldData) return [newMessage];
                const exists = oldData.some((msg) => msg.id === newMessage.id);
                return exists ? oldData : [...oldData, newMessage];
              });
            } else if (payload.eventType === "UPDATE") {
              const updatedMessage = payload.new as TypeMessage;
              
              queryClient.setQueryData([...MESSAGES_QUERY_KEY, chatId], (oldData: TypeMessage[] | undefined) => {
                if (!oldData) return [updatedMessage];
                return oldData.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg));
              });
            } else if (payload.eventType === "DELETE") {
              const deletedMessageId = (payload.old as TypeMessage).id;
              
              queryClient.setQueryData([...MESSAGES_QUERY_KEY, chatId], (oldData: TypeMessage[] | undefined) => {
                if (!oldData) return [];
                return oldData.filter((msg) => msg.id !== deletedMessageId);
              });
            }
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up real-time subscription:", error);
      return () => {}; // Return empty function on error
    }
  };

  return {
    // Queries
    messages: messagesQuery.data || [],
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

    // Real-time subscription
    subscribeToMessages,
  };
} 