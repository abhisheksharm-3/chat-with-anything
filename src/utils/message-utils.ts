import { MessageConstants } from "@/constants/MessageConstants";
import { TypeFile, TypeMessage } from "@/types/TypeSupabase";

/**
 * Compares two messages to determine if they are duplicates.
 * - For 'user' roles, it checks for identical content.
 * - For 'assistant' roles, it checks for identical content within a short time window.
 *
 * @param msg1 The first message to compare.
 * @param msg2 The second message to compare.
 * @returns `true` if the messages are considered duplicates, `false` otherwise.
 */
export const areMessagesDuplicate = (
  msg1: TypeMessage,
  msg2: TypeMessage
): boolean => {
  if (msg1.role !== msg2.role || msg1.content !== msg2.content) {
    return false;
  }

  // User messages are duplicates if content and role match.
  if (msg1.role === "user") {
    return true;
  }

  // Assistant messages are duplicates if they are also within a specific time window.
  if (msg1.role === "assistant") {
    const timeDiff = Math.abs(
      new Date(msg1.created_at).getTime() - new Date(msg2.created_at).getTime()
    );
    return timeDiff < MessageConstants.AssistantDuplicateTimeThresholdMs;
  }

  return false;
};

/**
 * Checks if a file object indicates a YouTube processing failure.
 *
 * @param file The file object to inspect.
 * @returns `true` if the file is a YouTube type with a 'failed' status and an error message.
 */
export const checkYouTubeProcessingError = (file: TypeFile): boolean => {
  return (
    file?.type === "youtube" &&
    file?.processing_status === "failed" &&
    !!file.processing_error
  );
};

/**
 * Synchronizes server-fetched messages with a local list, preserving pending optimistic updates.
 *
 * @param serverMessages The authoritative list of messages from the server.
 * @param localMessages The current local state, which may include optimistic UI messages.
 * @returns A new, synchronized, and deduplicated array of messages.
 */
export const syncMessagesWithOptimisticUpdates = (
  serverMessages: TypeMessage[],
  localMessages: TypeMessage[]
): TypeMessage[] => {
  // Filter for optimistic local messages that don't have a confirmed version on the server yet.
  const pendingOptimisticMessages = localMessages.filter((localMsg) => {
    if (!localMsg.id.startsWith(MessageConstants.OptimisticIdPrefix)) {
      return false; // Not an optimistic message.
    }
    // Keep the optimistic message if no server message is a duplicate of it.
    return !serverMessages.some((serverMsg) =>
      areMessagesDuplicate(localMsg, serverMsg)
    );
  });

  // The new list is the server messages plus any still-pending optimistic messages.
  return [...serverMessages, ...pendingOptimisticMessages];
};

/**
 * Creates a pair of optimistic messages (user and assistant) for immediate UI feedback.
 *
 * @param chatId The ID of the current chat.
 * @param content The text content of the user's message.
 * @returns An object containing `tempUserMessage` and `tempAiMessage`.
 */
export const createOptimisticMessages = (chatId: string, content: string) => {
  const timestamp = Date.now();
  const createdAt = new Date().toISOString();
  const tempId = `${MessageConstants.OptimisticIdPrefix}${timestamp}`;

  const tempUserMessage: TypeMessage = {
    id: tempId,
    chat_id: chatId,
    role: "user",
    content,
    created_at: createdAt,
  };

  const tempAiMessage: TypeMessage = {
    id: `${tempId}-ai`,
    chat_id: chatId,
    role: "assistant",
    content: MessageConstants.AssistantThinkingContent,
    created_at: createdAt,
  };

  return { tempUserMessage, tempAiMessage };
};

/**
 * Internal helper to create a message object from the assistant.
 * @private
 */
const _createAssistantMessage = (
  chatId: string,
  content: string
): TypeMessage => {
  return {
    id: `error-${Date.now()}`,
    chat_id: chatId,
    role: "assistant" as const,
    content,
    created_at: new Date().toISOString(),
  };
};

/**
 * Creates a formatted error message for a failed YouTube video processing job.
 *
 * @param chatId The ID of the current chat.
 * @param file The file object that failed to process.
 * @returns A message object formatted as an error from the assistant.
 */
export const createYouTubeErrorMessage = (
  chatId: string,
  file: TypeFile
): TypeMessage => {
  const errorMessage = `I couldn't process this YouTube video: ${
    file?.processing_error || MessageConstants.YouTubeDefaultError
  }`;
  return _createAssistantMessage(chatId, errorMessage);
};

/**
 * Creates a generic error message for a failed message send request.
 *
 * @param chatId The ID of the current chat.
 * @returns A generic error message object from the assistant.
 */
export const createErrorMessage = (chatId: string): TypeMessage => {
  return _createAssistantMessage(chatId, MessageConstants.GenericRequestError);
};