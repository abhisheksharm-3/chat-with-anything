"use server";

import { revalidatePath } from "next/cache";
import { sendMessageToGemini, isGeminiConfigured } from "@/utils/gemini/client";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { getFileContent, getImageData } from "../file-processing-utils";
import { queryDocuments } from "../processors";
import { SupabaseClient } from "@supabase/supabase-js";
import { TypeChat, TypeFile } from "@/types/TypeSupabase";
import { TypeGeminiImageData } from "@/types/TypeContent";

// --- Chat Creation ---

/**
 * Maps a raw file type to a standardized chat type.
 * @private
 */
const _mapFileTypeToChatType = (fileType: string | null): string | null => {
  if (!fileType) return null;

  const typeMap = new Map([
    ["youtube", "video"],
    ["web", "video"],
    ["url", "video"],
    ["docs", "doc"],
    ["sheets", "sheet"],
  ]);

  if (typeMap.has(fileType)) {
    return typeMap.get(fileType)!;
  }

  const validTypes = new Set(["pdf", "image", "doc", "video", "sheet", "slides"]);
  return validTypes.has(fileType) ? fileType : null;
};

/**
 * Creates a new chat session associated with a specific file and user.
 *
 * @param fileId The ID of the file to associate with the new chat.
 * @param userId The ID of the user creating the chat.
 * @returns A promise that resolves to the newly created chat object.
 * @throws An error if prerequisites are not met or a database error occurs.
 */
export const createChat = async (fileId: string, userId?: string) => {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API is not configured.");
  }
  if (!userId) {
    throw new Error("Authentication required to create a chat.");
  }

  const supabase = supabaseBrowserClient();

  try {
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("id, name, type")
      .eq("id", fileId)
      .single();

    if (fileError || !file) {
      throw new Error(`File not found with ID: ${fileId}. ${fileError?.message || ""}`);
    }

    const chatType = _mapFileTypeToChatType(file.type);

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({
        user_id: userId,
        file_id: fileId,
        title: `Chat about ${file.name || "file"}`,
        type: chatType,
      })
      .select()
      .single();

    if (chatError || !chat) {
      throw new Error(`Failed to create chat: ${chatError?.message}`);
    }

    console.log("Chat created successfully:", chat.id);
    revalidatePath("/chat");
    return chat;
  } catch (error) {
    console.error("Error in createChat:", error);
    throw error;
  }
};

// --- Message Sending ---

/**
 * Prepares the context (RAG content, image data) for the Gemini API call.
 * @private
 */
const _prepareContextForGemini = async (
  chat: TypeChat & { files: TypeFile },
  userQuery: string,
  supabase: SupabaseClient
): Promise<{ fileContent?: string; imageData?: TypeGeminiImageData; error?: string }> => {
  if (!chat.file_id) return {};

  const fileContent = await getFileContent(chat.file_id);
  if (!fileContent) return {};

  if (fileContent.startsWith("ERROR:")) {
    const errorMessage = fileContent.substring(6).trim();
    return { error: `I couldn't process this document: ${errorMessage}.` };
  }

  // Handle image files
  if (chat.files?.type === "image") {
    const imageData = await getImageData(supabase, chat.files);
    if (!imageData) {
      return { error: "I couldn't access the image file. Please try uploading it again." };
    }
    return { imageData };
  }

  // Handle RAG for various document types
  const ragTypes = new Set(["pdf", "doc", "docs", "sheet", "sheets", "slides"]);
  if (chat.type && ragTypes.has(chat.type)) {
    try {
      const relevantDocs = await queryDocuments(userQuery, chat.file_id, 5);
      const combinedContent = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
      return { fileContent: combinedContent || "No relevant sections found." };
    } catch (queryError) {
      console.error(`Error querying ${chat.type} content:`, queryError);
      return { fileContent: "Could not retrieve document context." };
    }
  }

  return { fileContent };
};

/**
 * Saves the assistant's message or an error message to the database.
 * @private
 */
const _saveAssistantMessage = async (
  chatId: string,
  content: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role: "assistant", content })
    .select()
    .single();

  if (error) {
    console.error("Error saving assistant message:", error);
  }
  return data;
};

/**
 * Sends a user's message, processes context, gets a response from Gemini, and saves messages.
 *
 * @param chatId The ID of the chat.
 * @param content The text content of the user's message.
 * @param messages The existing message history for context.
 * @returns A promise that resolves to the assistant's message object.
 */
export const sendMessage = async (
  chatId: string,
  content: string,
  messages?: { role: "user" | "model"; content: string }[]
) => {
  if (!isGeminiConfigured()) {
    return _saveAssistantMessage(chatId, "Gemini API is not configured.", supabaseBrowserClient());
  }

  const supabase = supabaseBrowserClient();

  try {
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*, files(*)")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) throw new Error("Chat not found.");

    await supabase.from("messages").insert({ chat_id: chatId, role: "user", content });

    const context = await _prepareContextForGemini(chat, content, supabase);
    if (context.error) {
      return await _saveAssistantMessage(chatId, context.error, supabase);
    }

    const formattedMessages: { role: "user" | "model"; content: string }[] = [
      ...(messages || []),
      { role: "user", content },
    ];

    const response = await sendMessageToGemini(
      formattedMessages,
      context.fileContent,
      context.imageData
    );

    return await _saveAssistantMessage(chatId, response, supabase);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    const errorMessage = "I'm sorry, an unexpected error occurred. Please try again.";
    return await _saveAssistantMessage(chatId, errorMessage, supabase);
  }
};