import { TypeFile, TypeMessage } from "@/types/TypeSupabase";

/**
 * Compares two messages to determine if they are duplicates.
 *
 * This function uses different logic based on the message role:
 * - For 'user' roles, it checks for identical content.
 * - For 'assistant' roles, it checks for identical content within a 5-second window.
 *
 * @param msg1 The first message to compare.
 * @param msg2 The second message to compare.
 * @returns `true` if the messages are considered duplicates, otherwise `false`.
 */
export function areMessagesDuplicate(
  msg1: TypeMessage,
  msg2: TypeMessage
): boolean {
  if (msg1.role === msg2.role && msg1.content === msg2.content) {
    if (msg1.role === "user") {
      return true;
    }
    // For assistant messages, check if they're within a short time window.
    const timeDiff = Math.abs(
      new Date(msg1.created_at).getTime() - new Date(msg2.created_at).getTime()
    );
    return timeDiff < 5000; // 5 seconds
  }
  return false;
}

/**
 * Checks if a file object indicates a YouTube processing failure.
 *
 * @param file The file object to inspect.
 * @returns `true` if the file is a YouTube type with a 'failed' status and an error message.
 */
export function checkYouTubeProcessingError(file: TypeFile): boolean {
  return (
    file?.type === "youtube" &&
    file?.processing_status === "failed" &&
    typeof file?.processing_error === "string" &&
    !!file.processing_error
  );
}

/**
 * Synchronizes server-fetched messages with a local list containing optimistic updates.
 *
 * It preserves temporary local messages (e.g., user messages not yet confirmed by the
 * server) and discards temporary messages that have been replaced by a server version.
 *
 * @param serverMessages The authoritative list of messages from the server.
 * @param localMessages The current local state, which may include optimistic UI messages.
 * @returns A new, synchronized, and deduplicated array of messages.
 */
export function syncMessagesWithOptimisticUpdates(
  serverMessages: TypeMessage[],
  localMessages: TypeMessage[]
): TypeMessage[] {
  // Filter for temporary local messages that are still pending.
  const uniqueTempMessages = localMessages.filter((localMsg) => {
    if (!localMsg.id.startsWith("temp-")) return false; // Not a temp message
    // Check if a confirmed version of this temp message exists on the server.
    return !serverMessages.some((serverMsg) =>
      areMessagesDuplicate(localMsg, serverMsg)
    );
  });

  // The new list is the server messages plus any still-pending optimistic messages.
  return [...serverMessages, ...uniqueTempMessages];
}

/**
 * Creates a pair of optimistic messages for immediate UI feedback when a user sends a message.
 *
 * @param chatId The ID of the current chat.
 * @param content The text content of the user's message.
 * @returns An object containing a temporary user message and a temporary "thinking" assistant message.
 */
export function createOptimisticMessages(chatId: string, content: string) {
  const timestamp = Date.now();
  const createdAt = new Date().toISOString();

  const tempUserMessage: TypeMessage = {
    id: `temp-${timestamp}`,
    chat_id: chatId,
    role: "user",
    content,
    created_at: createdAt,
  };

  const tempAiMessage: TypeMessage = {
    id: `temp-ai-${timestamp}`,
    chat_id: chatId,
    role: "assistant",
    content: "...",
    created_at: createdAt,
  };

  return { tempUserMessage, tempAiMessage };
}

/**
 * Creates a formatted error message for a failed YouTube video processing job.
 *
 * @param chatId The ID of the current chat.
 * @param file The file object that failed to process.
 * @returns A message object formatted as an error from the assistant.
 */
export function createYouTubeErrorMessage(
  chatId: string,
  file: TypeFile
): TypeMessage {
  return {
    id: `error-${Date.now()}`,
    chat_id: chatId,
    role: "assistant" as const,
    content: `I couldn't process this YouTube video: ${
      file?.processing_error || "No transcript available"
    }`,
    created_at: new Date().toISOString(),
  };
}

/**
 * Creates a generic error message for a failed message send request.
 *
 * @param chatId The ID of the current chat.
 * @returns A generic error message object from the assistant.
 */
export function createErrorMessage(chatId: string): TypeMessage {
  return {
    id: `error-${Date.now()}`,
    chat_id: chatId,
    role: "assistant" as const,
    content:
      "Sorry, there was an error processing your request. Please try again.",
    created_at: new Date().toISOString(),
  };
}