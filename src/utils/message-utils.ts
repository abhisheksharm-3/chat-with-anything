import { TypeFile, TypeMessage } from "@/types/TypeSupabase";

/**
 * Checks if two messages are duplicates based on content and timing
 */
export function areMessagesDuplicate(msg1: TypeMessage, msg2: TypeMessage): boolean {
    // Same role and content
    if (msg1.role === msg2.role && msg1.content === msg2.content) {
        // If they're both user messages, they're likely duplicates
        if (msg1.role === "user") {
            return true;
        }

        // For assistant messages, check if they're within a short time window (5 seconds)
        const time1 = new Date(msg1.created_at).getTime();
        const time2 = new Date(msg2.created_at).getTime();
        const timeDiff = Math.abs(time1 - time2);
        return timeDiff < 5000; // 5 seconds
    }

    return false;
}

/**
 * Checks if a file has YouTube processing errors
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
 * Syncs server-fetched messages with local optimistic updates
 */
export function syncMessagesWithOptimisticUpdates(
    serverMessages: TypeMessage[],
    localMessages: TypeMessage[]
): TypeMessage[] {
    // Get all temporary messages (optimistic updates)
    const tempMessages = localMessages.filter(
        (msg) => msg.id.startsWith("temp-") || msg.id.startsWith("error-")
    );

    // Get server message IDs to avoid duplicates
    const serverMessageIds = new Set(serverMessages.map((msg) => msg.id));

    // Filter out temp messages that have been replaced by server messages
    const uniqueTempMessages = tempMessages.filter((tempMsg) => {
        // If it's a temp user message, check if there's a server message with same content
        if (tempMsg.role === "user" && tempMsg.id.startsWith("temp-")) {
            const hasMatchingServerMessage = serverMessages.some((serverMsg) =>
                areMessagesDuplicate(tempMsg, serverMsg)
            );
            return !hasMatchingServerMessage;
        }

        // For other temp messages (AI thinking, errors), just check by ID
        return !serverMessageIds.has(tempMsg.id);
    });

    // Create new local messages array with server messages + unique temp messages
    const newLocalMessages = [...serverMessages, ...uniqueTempMessages];

    // Final deduplication pass to ensure no duplicates exist
    return newLocalMessages.filter((msg, index) => {
        // Check if this message is a duplicate of any previous message
        const isDuplicate = newLocalMessages
            .slice(0, index)
            .some((prevMsg) => areMessagesDuplicate(msg, prevMsg));

        return !isDuplicate;
    });
}

/**
 * Creates optimistic messages for immediate UI feedback
 */
export function createOptimisticMessages(chatId: string, content: string) {
    const timestamp = Date.now();

    const tempUserMessage: TypeMessage = {
        id: `temp-${timestamp}`,
        chat_id: chatId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
    };

    const tempAiMessage: TypeMessage = {
        id: `temp-ai-${timestamp}`,
        chat_id: chatId,
        role: "assistant",
        content: "...",
        created_at: new Date().toISOString(),
    };

    return { tempUserMessage, tempAiMessage };
}

/**
 * Creates a YouTube processing error message
 */
export function createYouTubeErrorMessage(chatId: string, file: TypeFile): TypeMessage {
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
 * Creates a generic error message for failed requests
 */
export function createErrorMessage(chatId: string): TypeMessage {
    return {
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: "assistant" as const,
        content: "Sorry, there was an error processing your request. Please try again.",
        created_at: new Date().toISOString(),
    };
}
