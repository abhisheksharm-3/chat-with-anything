import { TypeChatError } from "@/types/TypeChat";
import { TypeChat, TypeFile } from "@/types/TypeSupabase";
import { Metadata } from "next";
import { supabaseBrowserClient } from "./supabase/client";

/**
 * Creates a custom error object for chat-related operations.
 *
 * @param message The error message.
 * @param code An optional error code (e.g., from Supabase).
 * @param statusCode An optional HTTP status code.
 * @returns A ChatError object.
 */
export const createChatError = (
  message: string,
  code?: string,
  statusCode?: number,
): TypeChatError => {
  const error = new Error(message) as TypeChatError;
  error.name = "ChatError";
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

/**
 * A type guard to check if an error is a ChatError.
 *
 * @param error The value to check.
 * @returns True if the value is a ChatError, false otherwise.
 */
export const isChatError = (error: unknown): error is TypeChatError => {
  return error instanceof Error && error.name === "ChatError";
};

// Validation utilities
export const validateChatId = (chatId: unknown): chatId is string => {
  return (
    typeof chatId === "string" && chatId.trim() !== ""
  );
};

export const validateData = (data: unknown, dataName: string): boolean => {
  if (!data || typeof data !== "object") {
    throw createChatError(
      `Valid ${dataName} is required`,
      `INVALID_${dataName.toUpperCase()}`,
      400,
    );
  }
  return true;
};

// Error mapping utilities
export const getErrorFromSupabaseError = (
  error: { code?: string; message: string },
  operation: string,
): TypeChatError => {
  const errorMap: Record<string, { message: string; statusCode: number }> = {
    PGRST116: { message: "Resource not found", statusCode: 404 },
    PGRST301: { message: "Authentication required", statusCode: 401 },
  };

  const mapped = error.code ? errorMap[error.code] : undefined;
  if (mapped) {
    return createChatError(mapped.message, error.code, mapped.statusCode);
  }

  return createChatError(
    `Failed to ${operation}: ${error.message}`,
    error.code || "SUPABASE_ERROR",
    500,
  );
};

// Retry configuration
export const createRetryConfig = () => ({
  retry: (failureCount: number, error: unknown) => {
    if (
      isChatError(error) &&
      [401, 400, 403, 404].includes(error.statusCode || 0)
    ) {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
});

/**
 * Create a description based on file type and name
 */
const createFileDescription = (fileName: string, fileType: string): string => {
  const fileTypeDescriptions: Record<string, string> = {
    pdf: `Chat about PDF document: ${fileName}`,
    youtube: `Chat about YouTube video: ${fileName}`,
    text: `Chat about text document: ${fileName}`,
  };

  return fileTypeDescriptions[fileType] || `Chat about ${fileName}`;
};

/**
 * Generate fallback metadata for error cases
 */
const generateFallbackMetadata = (isNotFound = false): Metadata => ({
  title: isNotFound ? "Chat Not Found" : "Chat - Loading...",
  description: isNotFound 
    ? "The requested chat could not be found." 
    : "Chat conversation",
  robots: {
    index: false,
    follow: !isNotFound,
  },
});

/**
 * Fetch chat data from Supabase
 */
const fetchChatData = async (chatId: string): Promise<TypeChat | null> => {
  const supabase = supabaseBrowserClient();
  
  const { data: chat, error } = await supabase
    .from("chats")
    .select("id, title, file_id, created_at")
    .eq("id", chatId)
    .single<TypeChat>();

  if (error || !chat) {
    console.error("Error fetching chat data:", error);
    return null;
  }

  return chat;
};

/**
 * Fetch file data associated with the chat
 */
const fetchFileData = async (fileId: string): Promise<TypeFile | null> => {
  const supabase = supabaseBrowserClient();
  
  const { data: file, error } = await supabase
    .from("files")
    .select("name, type")
    .eq("id", fileId)
    .single<TypeFile>();

  if (error || !file) {
    console.error("Error fetching file data:", error);
    return null;
  }

  return file;
};

/**
 * Build comprehensive metadata object for a chat
 */
const buildMetadata = (
  chat: TypeChat,
  file: TypeFile | null,
  chatId: string
): Metadata => {
  const chatTitle = chat.title || "Untitled Chat";
  const baseTitle = `${chatTitle} - Chat`;
  
  // Create description based on file presence
  const description = file 
    ? createFileDescription(file.name, file.type || "unknown")
    : "Chat conversation";
  // Format creation date
  const createdDate = new Date(chat.created_at).toLocaleDateString();

  return {
    title: baseTitle,
    description,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: baseTitle,
      description,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: baseTitle,
      description,
    },
    alternates: {
      canonical: `/chat/${chatId}`,
    },
    other: {
      "chat-id": chatId,
      "creation-date": createdDate,
      ...(file?.name && { "document-name": file.name }),
      ...(file?.type && { "document-type": file.type }),
    },
  };
};

/**
 * Generate metadata for a chat page
 * 
 * @param chatId - The unique identifier for the chat
 * @returns Promise<Metadata> - The generated metadata object
 */
export const generateChatMetadata = async (chatId: string): Promise<Metadata> => {
  // Validate chatId format
  if (!chatId || typeof chatId !== 'string') {
    return generateFallbackMetadata();
  }

  try {
    // Fetch chat data
    const chat = await fetchChatData(chatId);
    if (!chat) {
      return generateFallbackMetadata(true);
    }

    // Fetch associated file data if available
    const file = chat.file_id ? await fetchFileData(chat.file_id) : null;

    // Build and return metadata
    return buildMetadata(chat, file, chatId);

  } catch (error) {
    console.error("Error generating metadata for chat:", chatId, error);
    return generateFallbackMetadata();
  }
};