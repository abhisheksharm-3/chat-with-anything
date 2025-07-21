import {
  checkNamespaceExists,
  processYoutubeVideo,
  processPdfDocument,
  processGenericDocument,
} from "@/utils/processors";
import { SupabaseClient } from "@supabase/supabase-js";
import { TypeFile } from "@/types/TypeSupabase";
import { supabaseBrowserClient } from "./supabase/client";
import { isYoutubeUrl } from "./youtube-utils";
import { TypeGeminiImageData } from "@/types/TypeContent";

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
export const getFileContent = async (fileId: string): Promise<string | null> => {
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
export const getImageData = async (
  supabase: SupabaseClient,
  file: TypeFile,
): Promise<TypeGeminiImageData | null> => {
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