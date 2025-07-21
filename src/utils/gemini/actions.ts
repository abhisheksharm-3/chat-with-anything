"use server";

import { revalidatePath } from "next/cache";
import {
  ChatMessage,
  sendMessageToGemini,
  isConfigured,
  ImageData,
} from "@/utils/gemini/client";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { getFileContent, getImageData } from "../gemini-utils";
import { queryDocuments } from "../processors";

/**
 * Creates a new chat session associated with a specific file and user.
 * It verifies file existence, maps the file type to a chat type, and inserts a new chat record into the database.
 * @param {string} fileId - The ID of the file to associate with the new chat.
 * @param {string} [userId] - The ID of the user creating the chat.
 * @returns {Promise<any>} A promise that resolves to the newly created chat object.
 * @throws {Error} If the Gemini API is not configured, user is not authenticated, the file is not found, or a database error occurs.
 */
export const createChat = async (fileId: string, userId?: string) => {
  console.log("createChat called with:", { fileId, userId });

  // Check if Gemini API is configured
  if (!isConfigured()) {
    console.error("Gemini API not configured");
    throw new Error(
      "Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.",
    );
  }

  // Use the userId passed from the client component
  if (!userId) {
    console.error("No userId provided to createChat");
    throw new Error("Authentication required. Please log in to continue.");
  }

  const supabase = supabaseBrowserClient();

  try {
    // First check if the file exists without any user_id filter
    console.log("Checking if file exists with ID:", fileId);
    const { data: fileCheck, error: fileCheckError } = await supabase
      .from("files")
      .select("id, user_id, name, type")
      .eq("id", fileId)
      .maybeSingle();

    if (fileCheckError) {
      console.error("Error checking file existence:", fileCheckError);
      throw new Error(`Error checking file: ${fileCheckError.message}`);
    }

    if (!fileCheck) {
      console.error("File not found in database:", fileId);
      throw new Error(`File not found with ID: ${fileId}`);
    }

    console.log("File found:", fileCheck);

    // Use the file we already found instead of querying again with user_id filter
    const file = fileCheck;

    // Map file type to a valid chat type
    // Valid chat types: 'pdf' | 'image' | 'doc' | 'video' | 'sheet' | 'slides' | null
    let chatType: string | null = file.type;

    // Map non-standard types to valid chat types
    if (file.type === "youtube" || file.type === "web" || file.type === "url") {
      chatType = "video";
    } else if (file.type === "docs") {
      chatType = "doc";
    } else if (file.type === "sheets") {
      chatType = "sheet";
    } else if (
      !["pdf", "image", "doc", "video", "sheet", "slides"].includes(
        file.type || "",
      )
    ) {
      // If it's not a recognized type, set to null
      chatType = null;
    }

    console.log(`Mapped file type '${file.type}' to chat type '${chatType}'`);

    // Create a new chat in the database
    console.log("Creating chat with user_id:", userId);
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

    if (chatError) {
      console.error("Error creating chat:", chatError);
      throw new Error(`Failed to create chat: ${chatError.message}`);
    }

    if (!chat) {
      console.error("No chat data returned after creation");
      throw new Error("Failed to create chat: No data returned");
    }

    console.log("Chat created successfully:", chat);
    revalidatePath("/chat");
    return chat;
  } catch (error) {
    console.error("Error in createChat function:", error);
    throw error;
  }
};

/**
 * Send a message to the chat
 * @param {string} chatId - The chat ID
 * @param {string} content - The message content
 * @returns {Promise<any>} The assistant's response
 */
export const sendMessage = async (
  chatId: string,
  content: string,
  messages?: ChatMessage[],
) => {
  const supabase = supabaseBrowserClient();

  try {
    // Get the chat details
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*, files(*)")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) {
      console.error("Error fetching chat:", chatError);
      throw new Error("Chat not found");
    }

    // Save the user's message
    const { data: userMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        role: "user",
        content: content,
      })
      .select()
      .single();

    if (userMessageError || !userMessage) {
      console.error("Error saving user message:", userMessageError);
      throw new Error("Failed to save user message");
    }

    // Check if Gemini is configured
    if (!isConfigured()) {
      const errorMessage =
        "Gemini API is not configured. Please check your environment variables.";
      console.error(errorMessage);

      // Save the error message as the assistant's response
      const { data: errorResponse, error: errorResponseError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          role: "assistant",
          content: errorMessage,
        })
        .select()
        .single();

      if (errorResponseError) {
        console.error("Error saving error response:", errorResponseError);
      }

      return errorResponse;
    }

    try {
      // Format messages for Gemini
      const formattedMessages = [
        ...(messages || []).map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          content: msg.content,
        })),
        { role: "user", content: content },
      ] as ChatMessage[];

      let fileContent: string | null = null;
      let imageData: ImageData | null = null;

      // Handle different file types
      if (chat.file_id) {
        // Get file content
        fileContent = await getFileContent(chat.file_id);
        console.log("File content retrieved:", fileContent ? "yes" : "no");

        // Check if we have an error from processing
        if (fileContent && fileContent.startsWith("ERROR:")) {
          console.error("Document processing error:", fileContent);

          // Return the error message to the user
          const errorMessage = fileContent.substring(6).trim(); // Remove "ERROR: " prefix

          // Save the error message as the assistant's response
          const { data: errorResponse, error: errorResponseError } =
            await supabase
              .from("messages")
              .insert({
                chat_id: chatId,
                role: "assistant",
                content: `I couldn't process this document: ${errorMessage}. Please try uploading a different file or contact support if the issue persists.`,
              })
              .select()
              .single();

          if (errorResponseError) {
            console.error("Error saving error response:", errorResponseError);
          }

          return errorResponse;
        }

        // Special handling for image files - get image data as buffer
        if (chat.files?.type === "image") {
          console.log("Image file detected, getting image data as buffer");

          // Get image data as buffer for Gemini
          imageData = await getImageData(supabase, chat.files);

          if (!imageData) {
            console.error("Failed to get image data as buffer");
            const { data: errorResponse, error: errorResponseError } =
              await supabase
                .from("messages")
                .insert({
                  chat_id: chatId,
                  role: "assistant",
                  content:
                    "I couldn't access the image file. Please try uploading the image again.",
                })
                .select()
                .single();

            if (errorResponseError) {
              console.error("Error saving error response:", errorResponseError);
            }

            return errorResponse;
          }

          // Don't use RAG context for images
          fileContent = null;
        }

        // Special handling for PDFs - use RAG with indexed content
        if (chat.type === "pdf" && fileContent === "PDF_CONTENT") {
          console.log("PDF content detected, using RAG with indexed content");

          try {
            // Get relevant PDF sections based on the query
            const relevantDocs = await queryDocuments(content, chat.file_id, 5);

            if (relevantDocs && relevantDocs.length > 0) {
              // Combine the relevant PDF sections
              const combinedContent = relevantDocs
                .map((doc) => doc.pageContent)
                .join("\n\n");

              console.log(
                "Retrieved relevant PDF sections:",
                combinedContent.length,
              );
              fileContent = combinedContent;
            } else {
              console.log("No relevant PDF sections found");
            }
          } catch (queryError) {
            console.error("Error querying PDF content:", queryError);
            // If query fails, we'll proceed without RAG context
            fileContent = null;
          }
        }

        // Special handling for docs, sheets, and slides - use RAG with indexed content
        const docTypes = ["doc", "docs", "sheet", "sheets", "slides"];
        const docPlaceholders = [
          "DOC_CONTENT",
          "DOCS_CONTENT",
          "SHEET_CONTENT",
          "SHEETS_CONTENT",
          "SLIDES_CONTENT",
        ];

        if (
          chat.type &&
          docTypes.includes(chat.type) &&
          fileContent &&
          docPlaceholders.includes(fileContent)
        ) {
          console.log(
            `${chat.type.toUpperCase()} content detected, using RAG with indexed content`,
          );

          try {
            // Get relevant document sections based on the query
            const relevantDocs = await queryDocuments(content, chat.file_id, 5);

            if (relevantDocs && relevantDocs.length > 0) {
              // Combine the relevant document sections
              const combinedContent = relevantDocs
                .map((doc) => doc.pageContent)
                .join("\n\n");

              console.log(
                `Retrieved relevant ${chat.type} sections:`,
                combinedContent.length,
              );
              fileContent = combinedContent;
            } else {
              console.log(`No relevant ${chat.type} sections found`);
            }
          } catch (queryError) {
            console.error(`Error querying ${chat.type} content:`, queryError);
            // If query fails, we'll proceed without RAG context
            fileContent = null;
          }
        }
      }

      // Get response from Gemini
      console.log("Sending message to Gemini...");
      const response = await sendMessageToGemini(
        formattedMessages,
        fileContent || undefined,
        imageData || undefined,
      );
      console.log("Received response from Gemini");

      // Save the assistant's response
      const { data: assistantMessage, error: assistantMessageError } =
        await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            role: "assistant",
            content: response,
          })
          .select()
          .single();

      if (assistantMessageError || !assistantMessage) {
        console.error("Error saving assistant message:", assistantMessageError);
        throw new Error("Failed to save assistant message");
      }

      return assistantMessage;
    } catch (geminiError) {
      console.error("Error in Gemini processing:", geminiError);

      // Save the error message as the assistant's response
      const { data: errorResponse, error: errorResponseError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          role: "assistant",
          content: `I'm sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists.`,
        })
        .select()
        .single();

      if (errorResponseError) {
        console.error("Error saving error response:", errorResponseError);
      }

      return errorResponse;
    }
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};
