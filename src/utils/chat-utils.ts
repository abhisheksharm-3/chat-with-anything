import { TypeChatError } from "@/types/chat";

/**
 * Creates a custom error object for chat-related operations.
 *
 * @param message The error message.
 * @param code An optional error code (e.g., from Supabase).
 * @param statusCode An optional HTTP status code.
 * @returns A ChatError object.
 */
export const createChatError = (message: string, code?: string, statusCode?: number): TypeChatError => {
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
  return typeof chatId === "string" &&
         chatId.trim() !== "" &&
         chatId.length <= 50;
};

export const validateData = (data: unknown, dataName: string): boolean => {
  if (!data || typeof data !== "object") {
    throw createChatError(`Valid ${dataName} is required`, `INVALID_${dataName.toUpperCase()}`, 400);
  }
  return true;
};

// Error mapping utilities
export const getErrorFromSupabaseError = (
  error: { code?: string; message: string },
  operation: string
): TypeChatError => {
  const errorMap: Record<string, { message: string; statusCode: number }> = {
    "PGRST116": { message: "Resource not found", statusCode: 404 },
    "PGRST301": { message: "Authentication required", statusCode: 401 },
  };

  const mapped = error.code ? errorMap[error.code] : undefined;
  if (mapped) {
    return createChatError(mapped.message, error.code, mapped.statusCode);
  }

  return createChatError(
    `Failed to ${operation}: ${error.message}`,
    error.code || "SUPABASE_ERROR",
    500
  );
};

// Retry configuration
export const createRetryConfig = () => ({
  retry: (failureCount: number, error: unknown) => {
    if (isChatError(error) && [401, 400, 403, 404].includes(error.statusCode || 0)) {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
});