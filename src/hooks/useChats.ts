"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeChat } from "@/types/supabase";
import { useUser } from "./useUser";
import { createChat as createChatWithGemini } from "@/utils/gemini/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define query keys as constants
export const CHATS_QUERY_KEY = ["chats"];

/**
 * Custom hook to fetch and manage user chats
 */
export const useChats = (chatId?: string) => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all user chats
  const chatsQuery = useQuery({
    queryKey: CHATS_QUERY_KEY,
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("chats")
        .select("*, files(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TypeChat[];
    },
    enabled: isAuthenticated && !!userId,
  });

  // Fetch a single chat by ID (only if chatId is provided)
  const isValidChatId = !!chatId && typeof chatId === 'string' && chatId.trim() !== '';
  
  const singleChatQuery = useQuery({
    queryKey: [...CHATS_QUERY_KEY, chatId],
    queryFn: async () => {
      if (!userId || !isValidChatId) return null;

      const { data, error } = await supabase
        .from("chats")
        .select("*, files(*)")
        .eq("id", chatId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - chat not found
          return null;
        }
        throw error;
      }
      return data as TypeChat;
    },
    enabled: isAuthenticated && !!userId && isValidChatId,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Create a new chat with Gemini
  const startChatWithFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      try {
        if (!userId) {
          throw new Error("No authenticated user");
        }
        
        if (!fileId) {
          throw new Error("No file ID provided");
        }
        
        console.log("Starting chat with file:", fileId);
        
        // Verify the file exists without checking user_id
        const { data: fileCheck, error: fileCheckError } = await supabase
          .from("files")
          .select("id")
          .eq("id", fileId)
          .maybeSingle();
          
        if (fileCheckError) {
          console.error("Error checking file:", fileCheckError);
        }
        
        if (!fileCheck) {
          console.error("File not found:", { fileId });
          throw new Error("File not found");
        }
        
        console.log("File exists, creating chat");
        
        // Pass the userId to the createChat function
        const chat = await createChatWithGemini(fileId, userId);
        console.log("Chat created successfully:", chat);
        return chat;
      } catch (error) {
        console.error("Error creating chat with Gemini:", error);
        
        // Check if this is an authentication error
        if (error instanceof Error && 
            (error.message.includes("Authentication required") || 
             error.message.includes("No authenticated user"))) {
          // Handle authentication errors by navigating to login
          router.push('/login');
          throw new Error("Authentication required. Redirecting to login...");
        }
        
        throw error;
      }
    },
    onSuccess: (newChat) => {
      // Update the chats list in the cache
      queryClient.setQueryData(CHATS_QUERY_KEY, (oldData: TypeChat[] | undefined) => {
        return oldData ? [newChat, ...oldData] : [newChat];
      });
      
      // Don't navigate here as the component that called this will handle navigation
      // This prevents double navigation attempts and potential loops
      // router.push(`/chat/${newChat.id}`);
    },
  });

  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async (chatData: Omit<TypeChat, "id" | "user_id" | "created_at">) => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      const newChat = {
        ...chatData,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from("chats")
        .insert(newChat)
        .select()
        .single();

      if (error) throw error;
      return data as TypeChat;
    },
    onSuccess: (newChat) => {
      // Update the chats list in the cache
      queryClient.setQueryData(CHATS_QUERY_KEY, (oldData: TypeChat[] | undefined) => {
        return oldData ? [newChat, ...oldData] : [newChat];
      });
    },
  });

  // Update an existing chat
  const updateChatMutation = useMutation({
    mutationFn: async ({ chatId, chatData }: { chatId: string; chatData: Partial<TypeChat> }) => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("chats")
        .update(chatData)
        .eq("id", chatId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as TypeChat;
    },
    onSuccess: (updatedChat) => {
      // Update the specific chat in the cache
      queryClient.setQueryData([...CHATS_QUERY_KEY, updatedChat.id], updatedChat);

      // Update the chat in the chats list
      queryClient.setQueryData(CHATS_QUERY_KEY, (oldData: TypeChat[] | undefined) => {
        if (!oldData) return [updatedChat];
        return oldData.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat));
      });
    },
  });

  // Delete a chat
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", userId);

      if (error) throw error;
      return chatId;
    },
    onSuccess: (chatId) => {
      // Remove the chat from the cache
      queryClient.removeQueries({ queryKey: [...CHATS_QUERY_KEY, chatId] });

      // Update the chats list in the cache
      queryClient.setQueryData(CHATS_QUERY_KEY, (oldData: TypeChat[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((chat) => chat.id !== chatId);
      });
    },
  });

  // Helper function to get chat by ID from cache or find it in the chats list
  const getChatById = (targetChatId: string): TypeChat | undefined => {
    if (!targetChatId || typeof targetChatId !== 'string' || targetChatId.trim() === '') {
      return undefined;
    }

    // First try to get from the individual chat cache
    const cachedChat = queryClient.getQueryData([...CHATS_QUERY_KEY, targetChatId]) as TypeChat | undefined;
    if (cachedChat) {
      return cachedChat;
    }

    // If not in individual cache, look in the chats list
    const chats = chatsQuery.data || [];
    return chats.find((chat) => chat.id === targetChatId);
  };

  // Handle deleting a chat with loading state
  const handleDeleteChat = async (chatId: string) => {
    try {
      setDeletingId(chatId);
      await deleteChatMutation.mutateAsync(chatId);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    // Queries - All chats
    chats: chatsQuery.data || [],
    isLoading: chatsQuery.isLoading,
    isError: chatsQuery.isError,
    error: chatsQuery.error,
    
    // Queries - Single chat (only if chatId was provided)
    chat: singleChatQuery.data,
    isChatLoading: singleChatQuery.isLoading,
    isChatError: singleChatQuery.isError,
    chatError: singleChatQuery.error,
    
    // Helper function
    getChatById,

    // Mutations
    startChatWithFile: startChatWithFileMutation.mutate,
    startChatWithFileAsync: startChatWithFileMutation.mutateAsync,
    isStartingChat: startChatWithFileMutation.isPending,
    
    createChat: createChatMutation.mutate,
    createChatAsync: createChatMutation.mutateAsync,
    isCreating: createChatMutation.isPending,

    updateChat: updateChatMutation.mutate,
    updateChatAsync: updateChatMutation.mutateAsync,
    isUpdating: updateChatMutation.isPending,

    deleteChat: deleteChatMutation.mutate,
    deleteChatAsync: deleteChatMutation.mutateAsync,
    isDeleting: deleteChatMutation.isPending,
    
    // Enhanced delete with loading state
    handleDeleteChat,
    deletingId,
  };
};