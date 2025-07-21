"use server";

import { revalidatePath } from "next/cache";
import {
  ChatMessage,
  sendMessageToGemini,
  isConfigured,
  ImageData,
} from "@/utils/gemini/client";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import {
  queryDocuments,
  checkNamespaceExists,
  processYoutubeVideo,
  processPdfDocument,
  processGenericDocument,
} from "@/utils/processors";
import { SupabaseClient } from "@supabase/supabase-js";
import { TypeFile } from "@/types/TypeSupabase";
import { isYoutubeUrl } from "../youtube-utils";

/**
 * Retrieves and processes the content of a file based on its type.
 * For documents like PDFs and YouTube videos, it checks if they have been processed and indexed.
 * If not, it triggers the processing and indexing flow.
 * For already indexed content, it returns a placeholder string, which signals
 * that the content should be retrieved via a RAG query later.
 * @param {string} fileId - The unique identifier of the file.
 * @returns {Promise<string | null>} A promise that resolves to the file content, a placeholder string
 * (e.g., 'PDF_CONTENT', 'YOUTUBE_TRANSCRIPT'), an error message prefixed with 'ERROR:', or null if not found.
 */
const getFileContent = async (fileId: string): Promise<string | null> => {
  const supabase = supabaseBrowserClient();

  // First get the file metadata from the database without filtering by user_id
  console.log("Getting file content for fileId:", fileId);
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fileError || !file) {
    console.error("Error fetching file metadata:", fileError);
    return null;
  }

  console.log("File data for content extraction:", file);

  // For image files, return a placeholder - we'll handle them differently
  if (file.type === "image") {
    console.log("Image file detected, returning placeholder");
    return "IMAGE_FILE";
  }

  // For YouTube videos, process and index the transcript if not already done
  if (
    (file.type === "video" || file.type === "youtube") &&
    file.url &&
    isYoutubeUrl(file.url)
  ) {
    try {
      // First check processing status in the database
      if (file.processing_status === "completed") {
        console.log("YouTube already processed according to database");
        return "YOUTUBE_TRANSCRIPT";
      }

      if (file.processing_status === "failed") {
        console.error(
          "YouTube processing previously failed:",
          file.processing_error,
        );
        return `ERROR: ${file.processing_error || "Failed to process YouTube video"}`;
      }

      // If not processed or status is unknown, check Pinecone
      console.log("Checking if YouTube transcript exists in Pinecone");
      const namespaceExists = await checkNamespaceExists(file.id);

      if (namespaceExists) {
        console.log(
          "YouTube transcript found in Pinecone, returning placeholder",
        );

        // Update status to completed if not already
        if (file.processing_status !== "completed") {
          await supabase
            .from("files")
            .update({ processing_status: "completed" })
            .eq("id", file.id);
        }

        // Return a placeholder - the actual content will be retrieved during query
        return "YOUTUBE_TRANSCRIPT";
      } else {
        console.log("YouTube transcript not found in Pinecone");

        // Try to process the YouTube video now
        console.log("Attempting to process YouTube video now");

        // Update status to processing
        await supabase
          .from("files")
          .update({ processing_status: "processing" })
          .eq("id", file.id);

        // Process the YouTube video
        const result = await processYoutubeVideo(file.url, file.id);

        if (!result.success) {
          console.error("Failed to process YouTube video:", result.error);

          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error:
                result.error || "Failed to process YouTube video",
            })
            .eq("id", file.id);

          return `ERROR: ${result.error || "Failed to process YouTube video"}`;
        }

        // Update status to completed
        await supabase
          .from("files")
          .update({
            processing_status: "completed",
            indexed_chunks: result.numDocs,
          })
          .eq("id", file.id);

        console.log("YouTube video processed and indexed successfully");
        return "YOUTUBE_TRANSCRIPT";
      }
    } catch (processingError) {
      console.error("Error processing YouTube video:", processingError);
      return `ERROR: Failed to process the YouTube video. ${
        processingError instanceof Error ? processingError.message : ""
      }`;
    }
  }

  // For URL type files, return the URL directly
  if (file.type === "web" || file.type === "url") {
    console.log("Returning URL as content:", file.url);
    return file.url;
  }

  // If we already have extracted text, use that
  if (file.full_text) {
    console.log("Using pre-extracted text");
    return file.full_text;
  }

  // For PDF files, try to query from Pinecone
  if (file.type === "pdf") {
    try {
      // First check processing status in the database
      if (file.processing_status === "completed") {
        console.log("PDF already processed according to database");
        return "PDF_CONTENT";
      }

      if (file.processing_status === "failed") {
        console.error(
          "PDF processing previously failed:",
          file.processing_error,
        );
        return `ERROR: ${file.processing_error || "Failed to process PDF"}`;
      }

      // If not processed or status is unknown, check Pinecone
      console.log("Checking if PDF content exists in Pinecone");
      const namespaceExists = await checkNamespaceExists(file.id);

      if (namespaceExists) {
        console.log("PDF content found in Pinecone, returning placeholder");

        // Update status to completed if not already
        if (file.processing_status !== "completed") {
          await supabase
            .from("files")
            .update({ processing_status: "completed" })
            .eq("id", file.id);
        }

        // Return a placeholder - the actual content will be retrieved during query
        return "PDF_CONTENT";
      } else {
        console.log("PDF content not found in Pinecone");

        // Try to process the PDF now
        console.log("Attempting to process PDF now");

        // Update status to processing
        await supabase
          .from("files")
          .update({ processing_status: "processing" })
          .eq("id", file.id);

        // Get the file content from storage
        let fileBlob;
        try {
          fileBlob = await getFileBlob(supabase, file);
        } catch (blobError) {
          console.error("Error getting file blob:", blobError);

          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error: String(blobError),
            })
            .eq("id", file.id);

          return `ERROR: Failed to read the PDF file. ${
            blobError instanceof Error ? blobError.message : ""
          }`;
        }

        if (!fileBlob) {
          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error: "Could not access the PDF file",
            })
            .eq("id", file.id);

          return "ERROR: Could not access the PDF file.";
        }

        // Process the PDF
        const result = await processPdfDocument(fileBlob, file.id);

        if (!result.success) {
          console.error("Failed to process PDF:", result.error);

          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error: result.error || "Failed to process PDF",
            })
            .eq("id", file.id);

          return `ERROR: ${result.error || "Failed to process PDF"}`;
        }

        // Update status to completed
        await supabase
          .from("files")
          .update({
            processing_status: "completed",
            indexed_chunks: result.numDocs,
          })
          .eq("id", file.id);

        console.log("PDF processed and indexed successfully");
        return "PDF_CONTENT";
      }
    } catch (processingError) {
      console.error("Error processing PDF:", processingError);
      return `ERROR: Failed to process the PDF file. ${
        processingError instanceof Error ? processingError.message : ""
      }`;
    }
  }

  // For doc, sheet, and slides files, process them like PDFs
  if (
    file.type === "doc" ||
    file.type === "docs" ||
    file.type === "sheet" ||
    file.type === "sheets" ||
    file.type === "slides"
  ) {
    try {
      // First check processing status in the database
      if (file.processing_status === "completed") {
        console.log(
          `${file.type.toUpperCase()} already processed according to database`,
        );
        return `${file.type.toUpperCase()}_CONTENT`;
      }

      if (file.processing_status === "failed") {
        console.error(
          `${file.type} processing previously failed:`,
          file.processing_error,
        );
        return `ERROR: ${
          file.processing_error || `Failed to process ${file.type}`
        }`;
      }

      // If not processed or status is unknown, check Pinecone
      console.log(`Checking if ${file.type} content exists in Pinecone`);
      const namespaceExists = await checkNamespaceExists(file.id);

      if (namespaceExists) {
        console.log(
          `${file.type.toUpperCase()} content found in Pinecone, returning placeholder`,
        );

        // Update status to completed if not already
        if (file.processing_status !== "completed") {
          await supabase
            .from("files")
            .update({ processing_status: "completed" })
            .eq("id", file.id);
        }

        // Return a placeholder - the actual content will be retrieved during query
        return `${file.type.toUpperCase()}_CONTENT`;
      } else {
        console.log(`${file.type.toUpperCase()} content not found in Pinecone`);

        // Try to process the document now
        console.log(`Attempting to process ${file.type} now`);

        // Update status to processing
        await supabase
          .from("files")
          .update({ processing_status: "processing" })
          .eq("id", file.id);

        // Get the file content from storage
        let fileBlob;
        try {
          fileBlob = await getFileBlob(supabase, file);
        } catch (blobError) {
          console.error("Error getting file blob:", blobError);

          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error: String(blobError),
            })
            .eq("id", file.id);

          return `ERROR: Failed to read the ${file.type} file. ${
            blobError instanceof Error ? blobError.message : ""
          }`;
        }

        if (!fileBlob) {
          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error: `Could not access the ${file.type} file`,
            })
            .eq("id", file.id);

          return `ERROR: Could not access the ${file.type} file.`;
        }

        // Process the document
        const result = await processGenericDocument(
          fileBlob,
          file.id,
          file.type,
        );

        if (!result.success) {
          console.error(`Failed to process ${file.type}:`, result.error);

          // Update status to failed
          await supabase
            .from("files")
            .update({
              processing_status: "failed",
              processing_error:
                result.error || `Failed to process ${file.type}`,
            })
            .eq("id", file.id);

          return `ERROR: ${result.error || `Failed to process ${file.type}`}`;
        }

        // Update status to completed
        await supabase
          .from("files")
          .update({
            processing_status: "completed",
            indexed_chunks: result.numDocs,
          })
          .eq("id", file.id);

        console.log(
          `${file.type.toUpperCase()} processed and indexed successfully`,
        );
        return `${file.type.toUpperCase()}_CONTENT`;
      }
    } catch (processingError) {
      console.error(`Error processing ${file.type}:`, processingError);
      return `ERROR: Failed to process the ${file.type} file. ${
        processingError instanceof Error ? processingError.message : ""
      }`;
    }
  }

  // Default case if no specific handling
  return null;
};

/**
 * Helper function to download a file's blob content from Supabase storage.
 * It tries various possible paths to locate the file since the exact storage path might vary.
 * @param {SupabaseClient} supabase - An instance of the Supabase client.
 * @param {TypeFile} file - The file metadata object from the database.
 * @returns {Promise<Blob | null>} A promise that resolves with the file Blob, or null if it cannot be downloaded.
 */
const getFileBlob = async (
  supabase: SupabaseClient,
  file: TypeFile,
): Promise<Blob | null> => {
  // Try with direct URL if available
  if (file.url && file.url.includes("file-storage")) {
    try {
      // Extract path from URL
      const urlObj = new URL(file.url);
      const pathMatch = urlObj.pathname.match(/\/file-storage\/([^?]+)/);
      const filePath = pathMatch ? pathMatch[1] : null;

      if (filePath) {
        console.log("Trying to download using path from URL:", filePath);
        const result = await supabase.storage
          .from("file-storage")
          .download(filePath);

        if (!result.error && result.data) {
          return result.data;
        }
      }
    } catch (urlError) {
      console.error("Error extracting path from URL:", urlError);
    }
  }

  // Try with user_id/filename format (if we have user_id)
  if (file.user_id) {
    const filePath1 = `${file.user_id}/${Date.now()}_${file.name}`;
    console.log("Trying path 1:", filePath1);
    const result1 = await supabase.storage
      .from("file-storage")
      .download(filePath1);

    if (!result1.error && result1.data) {
      return result1.data;
    }
  }

  // Try with various path formats
  const possiblePaths = [
    `${file.user_id || "unknown"}/${file.id}`,
    `${file.id}`,
    `uploads/${file.id}`,
    `${file.name}`,
  ];

  for (const path of possiblePaths) {
    console.log(`Trying path: ${path}`);
    const result = await supabase.storage.from("file-storage").download(path);

    if (!result.error && result.data) {
      return result.data;
    }
  }

  return null;
};

/**
 * Helper function to get image data as buffer for Gemini
 * @param {SupabaseClient} supabase - An instance of the Supabase client.
 * @param {TypeFile} file - The file metadata object from the database.
 * @returns {Promise<ImageData | null>} A promise that resolves with the image data, or null if it cannot be downloaded.
 */
const getImageData = async (
  supabase: SupabaseClient,
  file: TypeFile,
): Promise<ImageData | null> => {
  try {
    const fileBlob = await getFileBlob(supabase, file);
    if (!fileBlob) {
      return null;
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      mimeType: fileBlob.type,
    };
  } catch (error) {
    console.error("Error getting image data:", error);
    return null;
  }
};

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
