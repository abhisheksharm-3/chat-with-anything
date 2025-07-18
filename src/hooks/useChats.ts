"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeChat } from "@/types/supabase";
import { useUser } from "./useUser";
import { createChat as createChatWithGemini } from "@/utils/gemini/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** The base query key for all chat-related queries in React Query. */
export const CHATS_QUERY_KEY = ["chats"];

/**
 * A comprehensive custom hook for fetching and managing user chats.
 * It handles fetching all chats, a single chat, and provides mutations for
 * creating, updating, and deleting chats using React Query and Supabase.
 *
 * @param {string} [chatId] - If provided, the hook will also fetch the specific chat with this ID.
 * @returns {object} An object containing chat data, loading/error states, and mutation functions.
 * @property {TypeChat[]} chats - An array of all chats for the current user. Defaults to an empty array.
 * @property {boolean} isLoading - True if the initial list of chats is being fetched.
 * @property {Error | null} error - The error object if fetching the list of chats fails.
 * @property {TypeChat | null | undefined} chat - The specific chat data if a `chatId` was provided and found.
 * @property {boolean} isChatLoading - True if the single chat is being fetched.
 * @property {Error | null} chatError - The error object if fetching the single chat fails.
 * @property {(targetChatId: string) => TypeChat | undefined} getChatById - A helper to find a chat in the cache.
 * @property {(fileId: string) => void} startChatWithFile - Mutation function to start a new chat with a file via a server action.
 * @property {(fileId: string) => Promise<TypeChat>} startChatWithFileAsync - Async version of the `startChatWithFile` mutation.
 * @property {boolean} isStartingChat - True if the `startChatWithFile` mutation is pending.
 * @property {(chatData: Omit<...>) => void} createChat - Mutation function to create a new chat.
 * @property {boolean} isCreating - True if the `createChat` mutation is pending.
 * @property {(params: {chatId: string, chatData: Partial<TypeChat>}) => void} updateChat - Mutation function to update a chat.
 * @property {boolean} isUpdating - True if the `updateChat` mutation is pending.
 * @property {(chatId: string) => void} deleteChat - Mutation function to delete a chat.
 * @property {boolean} isDeleting - True if the `deleteChat` mutation is pending.
 * @property {(chatId: string) => Promise<void>} handleDeleteChat - An async wrapper for deleting a chat that manages per-item loading state.
 * @property {string | null} deletingId - The ID of the chat currently being deleted by `handleDeleteChat`.
 */
export const useChats = (chatId?: string) => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- QUERIES ---

  /** Query to fetch all chats for the authenticated user. */
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

  /** Query to fetch a single chat by its ID, if a chatId is provided. */
  const isValidChatId =
    !!chatId && typeof chatId === "string" && chatId.trim() !== "";
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
        if (error.code === "PGRST116") return null; // Chat not found is not a hard error
        throw error;
      }
      return data as TypeChat;
    },
    enabled: isAuthenticated && !!userId && isValidChatId,
    staleTime: 30000, // Data is considered fresh for 30 seconds
  });

  // --- MUTATIONS ---

  /** Mutation to create a new chat associated with a file using a server action. */
  const startChatWithFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      if (!userId) throw new Error("No authenticated user");
      if (!fileId) throw new Error("No file ID provided");

      const { data: fileCheck, error: fileCheckError } = await supabase
        .from("files")
        .select("id")
        .eq("id", fileId)
        .maybeSingle();
      if (fileCheckError) console.error("Error checking file:", fileCheckError);
      if (!fileCheck) throw new Error("File not found");

      try {
        const chat = await createChatWithGemini(fileId, userId);
        return chat;
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("Authentication required") ||
            error.message.includes("No authenticated user"))
        ) {
          router.push("/login");
          throw new Error("Authentication required. Redirecting to login...");
        }
        throw error;
      }
    },
    onSuccess: (newChat) => {
      queryClient.setQueryData(
        CHATS_QUERY_KEY,
        (oldData: TypeChat[] | undefined) =>
          oldData ? [newChat, ...oldData] : [newChat]
      );
    },
  });

  /** Mutation to create a new chat record directly. */
  const createChatMutation = useMutation({
    mutationFn: async (
      chatData: Omit<TypeChat, "id" | "user_id" | "created_at">
    ) => {
      if (!userId) throw new Error("No authenticated user");
      const newChat = { ...chatData, user_id: userId };
      const { data, error } = await supabase
        .from("chats")
        .insert(newChat)
        .select()
        .single();
      if (error) throw error;
      return data as TypeChat;
    },
    onSuccess: (newChat) => {
      queryClient.setQueryData(
        CHATS_QUERY_KEY,
        (oldData: TypeChat[] | undefined) =>
          oldData ? [newChat, ...oldData] : [newChat]
      );
    },
  });

  /** Mutation to update an existing chat. */
  const updateChatMutation = useMutation({
    mutationFn: async ({
      chatId,
      chatData,
    }: {
      chatId: string;
      chatData: Partial<TypeChat>;
    }) => {
      if (!userId) throw new Error("No authenticated user");
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
      queryClient.setQueryData(
        [...CHATS_QUERY_KEY, updatedChat.id],
        updatedChat
      ); // Update single chat cache
      queryClient.setQueryData(
        CHATS_QUERY_KEY,
        (oldData: TypeChat[] | undefined) =>
          oldData?.map((chat) =>
            chat.id === updatedChat.id ? updatedChat : chat
          ) || [updatedChat]
      ); // Update list cache
    },
  });

  /** Mutation to delete a chat. */
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      if (!userId) throw new Error("No authenticated user");
      const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", userId);
      if (error) throw error;
      return chatId;
    },
    onSuccess: (chatId) => {
      queryClient.removeQueries({ queryKey: [...CHATS_QUERY_KEY, chatId] }); // Remove single chat cache
      queryClient.setQueryData(
        CHATS_QUERY_KEY,
        (oldData: TypeChat[] | undefined) =>
          oldData?.filter((chat) => chat.id !== chatId) || []
      ); // Update list cache
    },
  });

  // --- HELPER FUNCTIONS ---

  /**
   * Retrieves a chat by its ID, first checking the specific query cache,
   * then falling back to the main list of chats.
   * @param {string} targetChatId - The ID of the chat to find.
   * @returns {TypeChat | undefined} The chat object if found, otherwise undefined.
   */
  const getChatById = (targetChatId: string): TypeChat | undefined => {
    if (
      !targetChatId ||
      typeof targetChatId !== "string" ||
      targetChatId.trim() === ""
    )
      return undefined;
    const cachedChat = queryClient.getQueryData([
      ...CHATS_QUERY_KEY,
      targetChatId,
    ]) as TypeChat | undefined;
    if (cachedChat) return cachedChat;
    return (chatsQuery.data || []).find((chat) => chat.id === targetChatId);
  };

  /**
   * An async wrapper for the delete mutation that manages a per-item loading state.
   * This is useful for showing a loading spinner on the specific item being deleted.
   * @param {string} chatId - The ID of the chat to delete.
   */
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

    // Queries - Single chat
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

    // Enhanced delete with per-item loading state
    handleDeleteChat,
    deletingId,
  };
};
