"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeChat } from "@/types/TypeSupabase";
import { useUser } from "./useUser";
import { createChat as createChatWithGemini } from "@/utils/gemini/actions";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import {
  createChatError,
  createRetryConfig,
  getErrorFromSupabaseError,
  isChatError,
  validateChatId,
  validateData,
} from "@/utils/chat-utils";

/** The base query key for all chat-related queries in React Query. */
export const CHATS_QUERY_KEY = ["chats"];

/**
 * A comprehensive custom hook for fetching and managing user chats with enhanced error handling.
 */
export const useChats = (chatId?: string) => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Centralized error handler
  const handleError = useCallback(
    (error: unknown, context: string): Error => {
      console.error(`Error in ${context}:`, error);

      if (isChatError(error)) return error;

      if (error instanceof Error) {
        // Authentication errors
        if (
          error.message.includes("JWT expired") ||
          error.message.includes("refresh_token_not_found") ||
          error.message.includes("Authentication required")
        ) {
          router.push("/login");
          return createChatError(
            "Authentication expired. Please log in again.",
            "AUTH_EXPIRED",
            401,
          );
        }

        // Network errors
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          return createChatError(
            "Network error. Please check your connection.",
            "NETWORK_ERROR",
            0,
          );
        }

        return error;
      }

      return createChatError(
        `Unknown error in ${context}`,
        "UNKNOWN_ERROR",
        500,
      );
    },
    [router],
  );

  // Validation helper
  const validateUserAuth = useCallback(() => {
    if (!userId) {
      throw createChatError("User not authenticated", "NO_USER_ID", 401);
    }
    if (!supabase) {
      throw createChatError(
        "Database connection not available",
        "NO_SUPABASE",
        500,
      );
    }
  }, [userId, supabase]);

  // Cache update utilities
  const updateChatListCache = useCallback(
    (updater: (oldData: TypeChat[] | undefined) => TypeChat[]) => {
      try {
        queryClient.setQueryData(CHATS_QUERY_KEY, updater);
      } catch (error) {
        console.error("Error updating chat list cache:", error);
      }
    },
    [queryClient],
  );

  const addChatToCache = useCallback(
    (newChat: TypeChat) => {
      updateChatListCache((oldData) => {
        if (!Array.isArray(oldData)) return [newChat];
        return [newChat, ...oldData];
      });
    },
    [updateChatListCache],
  );

  const updateChatInCache = useCallback(
    (updatedChat: TypeChat) => {
      // Update single chat cache
      queryClient.setQueryData(
        [...CHATS_QUERY_KEY, updatedChat.id],
        updatedChat,
      );

      // Update list cache
      updateChatListCache((oldData) => {
        if (!Array.isArray(oldData)) return [updatedChat];
        return oldData.map((chat) =>
          chat.id === updatedChat.id ? updatedChat : chat,
        );
      });
    },
    [queryClient, updateChatListCache],
  );

  const removeChatFromCache = useCallback(
    (chatId: string) => {
      queryClient.removeQueries({ queryKey: [...CHATS_QUERY_KEY, chatId] });
      updateChatListCache((oldData) => {
        if (!Array.isArray(oldData)) return [];
        return oldData.filter((chat) => chat.id !== chatId);
      });
    },
    [queryClient, updateChatListCache],
  );

  // --- QUERIES ---

  /** Query to fetch all chats for the authenticated user. */
  const chatsQuery = useQuery({
    queryKey: CHATS_QUERY_KEY,
    queryFn: async () => {
      try {
        validateUserAuth();

        const { data, error } = await supabase
          .from("chats")
          .select("*, files(*)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw getErrorFromSupabaseError(error, "fetch chats");
        }

        if (!Array.isArray(data)) {
          throw createChatError(
            "Invalid data format received",
            "INVALID_DATA",
            500,
          );
        }

        return data as TypeChat[];
      } catch (error) {
        throw handleError(error, "fetchChats");
      }
    },
    enabled: isAuthenticated && !!userId,
    ...createRetryConfig(),
  });

  /** Query to fetch a single chat by its ID. */
  const isValidChatId = validateChatId(chatId);

  const singleChatQuery = useQuery({
    queryKey: [...CHATS_QUERY_KEY, chatId],
    queryFn: async () => {
      try {
        validateUserAuth();

        if (!isValidChatId) {
          throw createChatError(
            "Invalid chat ID provided",
            "INVALID_CHAT_ID",
            400,
          );
        }

        const { data, error } = await supabase
          .from("chats")
          .select("*, files(*)")
          .eq("id", chatId)
          .eq("user_id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") return null;
          throw getErrorFromSupabaseError(error, "fetch chat");
        }

        return data as TypeChat;
      } catch (error) {
        throw handleError(error, "fetchSingleChat");
      }
    },
    enabled: isAuthenticated && !!userId && isValidChatId,
    staleTime: 30000,
    ...createRetryConfig(),
  });

  // --- MUTATIONS ---

  /** Mutation to create a new chat associated with a file. */
  const startChatWithFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      try {
        validateUserAuth();

        if (!fileId?.trim()) {
          throw createChatError(
            "Valid file ID is required",
            "INVALID_FILE_ID",
            400,
          );
        }

        // Verify file exists and belongs to user
        const { data: fileCheck, error: fileCheckError } = await supabase
          .from("files")
          .select("id, user_id")
          .eq("id", fileId)
          .maybeSingle();

        if (fileCheckError) {
          throw getErrorFromSupabaseError(fileCheckError, "verify file");
        }

        if (!fileCheck) {
          throw createChatError("File not found", "FILE_NOT_FOUND", 404);
        }

        if (fileCheck.user_id !== userId) {
          throw createChatError(
            "File access denied",
            "FILE_ACCESS_DENIED",
            403,
          );
        }

        const chat = await createChatWithGemini(fileId, userId);

        if (!chat?.id) {
          throw createChatError(
            "Failed to create chat - invalid response",
            "INVALID_CHAT_RESPONSE",
            500,
          );
        }

        return chat;
      } catch (error) {
        throw handleError(error, "startChatWithFile");
      }
    },
    onSuccess: addChatToCache,
    onError: (error) => console.error("Failed to start chat with file:", error),
  });

  /** Mutation to create a new chat record directly. */
  const createChatMutation = useMutation({
    mutationFn: async (
      chatData: Omit<TypeChat, "id" | "user_id" | "created_at">,
    ) => {
      try {
        validateUserAuth();
        validateData(chatData, "chat data");

        const newChat = { ...chatData, user_id: userId };
        const { data, error } = await supabase
          .from("chats")
          .insert(newChat)
          .select()
          .single();

        if (error) {
          throw getErrorFromSupabaseError(error, "create chat");
        }

        if (!data) {
          throw createChatError(
            "No data returned from chat creation",
            "NO_DATA_RETURNED",
            500,
          );
        }

        return data as TypeChat;
      } catch (error) {
        throw handleError(error, "createChat");
      }
    },
    onSuccess: addChatToCache,
    onError: (error) => console.error("Failed to create chat:", error),
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
      try {
        validateUserAuth();

        if (!validateChatId(chatId)) {
          throw createChatError(
            "Valid chat ID is required",
            "INVALID_CHAT_ID",
            400,
          );
        }

        validateData(chatData, "chat data");

        const { data, error } = await supabase
          .from("chats")
          .update(chatData)
          .eq("id", chatId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          throw getErrorFromSupabaseError(error, "update chat");
        }

        if (!data) {
          throw createChatError(
            "Chat not found or access denied",
            "CHAT_NOT_FOUND",
            404,
          );
        }

        return data as TypeChat;
      } catch (error) {
        throw handleError(error, "updateChat");
      }
    },
    onSuccess: updateChatInCache,
    onError: (error) => console.error("Failed to update chat:", error),
  });

  /** Mutation to delete a chat. */
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      try {
        validateUserAuth();

        if (!validateChatId(chatId)) {
          throw createChatError(
            "Valid chat ID is required",
            "INVALID_CHAT_ID",
            400,
          );
        }

        const { error } = await supabase
          .from("chats")
          .delete()
          .eq("id", chatId)
          .eq("user_id", userId);

        if (error) {
          throw getErrorFromSupabaseError(error, "delete chat");
        }

        return chatId;
      } catch (error) {
        throw handleError(error, "deleteChat");
      }
    },
    onSuccess: removeChatFromCache,
    onError: (error) => console.error("Failed to delete chat:", error),
  });

  // --- HELPER FUNCTIONS ---

  const getChatById = useCallback(
    (targetChatId: string): TypeChat | undefined => {
      try {
        if (!validateChatId(targetChatId)) return undefined;

        // Check specific query cache first
        const cachedChat = queryClient.getQueryData([
          ...CHATS_QUERY_KEY,
          targetChatId,
        ]) as TypeChat | undefined;
        if (cachedChat) return cachedChat;

        // Fall back to main list
        const chats = chatsQuery.data;
        return Array.isArray(chats)
          ? chats.find((chat) => chat?.id === targetChatId)
          : undefined;
      } catch (error) {
        console.error("Error getting chat by ID:", error);
        return undefined;
      }
    },
    [queryClient, chatsQuery.data],
  );

  const handleDeleteChat = useCallback(
    async (chatId: string): Promise<void> => {
      try {
        if (!validateChatId(chatId)) {
          throw createChatError(
            "Valid chat ID is required",
            "INVALID_CHAT_ID",
            400,
          );
        }

        setDeletingId(chatId);
        await deleteChatMutation.mutateAsync(chatId);
      } catch (error) {
        console.error("Failed to delete chat:", error);
        throw handleError(error, "handleDeleteChat");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteChatMutation, handleError],
  );

  return {
    // Queries - All chats
    chats: chatsQuery.data || [],
    isLoading: chatsQuery.isLoading,
    isError: chatsQuery.isError,
    error: chatsQuery.error,
    refetch: chatsQuery.refetch,

    // Queries - Single chat
    chat: singleChatQuery.data,
    isChatLoading: singleChatQuery.isLoading,
    isChatError: singleChatQuery.isError,
    chatError: singleChatQuery.error,
    refetchChat: singleChatQuery.refetch,

    // Helper function
    getChatById,

    // Mutations
    startChatWithFile: startChatWithFileMutation.mutate,
    startChatWithFileAsync: startChatWithFileMutation.mutateAsync,
    isStartingChat: startChatWithFileMutation.isPending,
    startChatError: startChatWithFileMutation.error,

    createChat: createChatMutation.mutate,
    createChatAsync: createChatMutation.mutateAsync,
    isCreating: createChatMutation.isPending,
    createError: createChatMutation.error,

    updateChat: updateChatMutation.mutate,
    updateChatAsync: updateChatMutation.mutateAsync,
    isUpdating: updateChatMutation.isPending,
    updateError: updateChatMutation.error,

    deleteChat: deleteChatMutation.mutate,
    deleteChatAsync: deleteChatMutation.mutateAsync,
    isDeleting: deleteChatMutation.isPending,
    deleteError: deleteChatMutation.error,

    handleDeleteChat,
    deletingId,
  };
};
