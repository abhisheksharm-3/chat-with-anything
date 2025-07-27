import {
  checkNamespaceExists,
  processYoutubeVideo,
  processPdfDocument,
  processGenericDocument,
} from "@/utils/processors";
import { SupabaseClient } from "@supabase/supabase-js";
import { TypeFile } from "@/types/TypeSupabase";
import { supabaseBrowserClient } from "./supabase/client";
import { TypeGeminiImageData } from "@/types/TypeContent";
import { extractYoutubeVideoId } from "./youtube-utils";

/**
 * Retrieves the content or triggers the processing for a given file.
 * For documents and videos, it initiates a processing and indexing flow if not already completed.
 * It returns placeholders for content that is retrieved via RAG, and direct content for others (e.g., URLs).
 *
 * @param fileId The unique identifier of the file.
 * @returns A promise that resolves to the file content, a placeholder string
 * (e.g., 'PDF_CONTENT'), an error message, or null.
 */
export const getFileContent = async (
  fileId: string
): Promise<string | null> => {
  const supabase = supabaseBrowserClient();

  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fileError || !file) {
    console.error("Error fetching file metadata:", fileError?.message);
    return null;
  }

  // Use a switch statement to handle different file types cleanly.
  switch (file.type) {
    case "image":
      return "IMAGE_FILE";

    case "video":
    case "youtube":
      if (file.url && extractYoutubeVideoId(file.url)) {
        return _handleProcessableFile({
          supabase,
          file,
          placeholder: "YOUTUBE_TRANSCRIPT",
          processor: () => processYoutubeVideo(file.url!, file.id),
        });
      }
      return file.url ?? null; // Fallback for non-YouTube videos

    case "pdf":
      return _handleProcessableFile({
        supabase,
        file,
        placeholder: "PDF_CONTENT",
        processor: async () => {
          const blob = await getFileBlob(supabase, file);
          if (!blob)
            throw new Error("Could not read the PDF file from storage.");
          return processPdfDocument(blob, file.id);
        },
      });

    case "doc":
    case "docs":
    case "sheet":
    case "sheets":
    case "slides":
      return _handleProcessableFile({
        supabase,
        file,
        placeholder: `${file.type.toUpperCase()}_CONTENT`,
        processor: async () => {
          const blob = await getFileBlob(supabase, file);
          if (!blob)
            throw new Error(
              `Could not read the ${file.type} file from storage.`
            );
          return processGenericDocument(blob, file.id, file.type);
        },
      });

    case "web":
    case "url":
      return file.url;

    default:
      // Use pre-extracted text if available, otherwise return null.
      return file.full_text ?? null;
  }
};

/**
 * Internal helper to handle the processing logic for indexable files.
 * This function checks the file's status, verifies against the vector store,
 * and triggers processing if necessary, updating the status in Supabase along the way.
 * @private
 */
async function _handleProcessableFile({
  supabase,
  file,
  placeholder,
  processor,
}: {
  supabase: SupabaseClient;
  file: TypeFile;
  placeholder: string;
  processor: () => Promise<{
    success: boolean;
    error?: string;
    numDocs?: number;
  }>;
}): Promise<string> {
  const { id: fileId, processing_status, processing_error } = file;

  // 1. Check for a previously failed status.
  if (processing_status === "failed") {
    console.error(
      `Processing previously failed for file ${fileId}:`,
      processing_error
    );
    return `ERROR: ${processing_error || `Failed to process ${file.type}`}`;
  }

  // 2. Check if already marked as completed or if namespace exists in Pinecone.
  const namespaceExists =
    processing_status === "completed" || (await checkNamespaceExists(fileId));

  if (namespaceExists) {
    // If the namespace exists but status isn't 'completed', update it now.
    if (processing_status !== "completed") {
      await supabase
        .from("files")
        .update({ processing_status: "completed" })
        .eq("id", fileId);
    }
    return placeholder;
  }

  // 3. If not processed, trigger the processing now.
  try {
    console.log(`Processing ${file.type} file now: ${fileId}`);
    await supabase
      .from("files")
      .update({ processing_status: "processing" })
      .eq("id", fileId);

    const result = await processor();

    if (!result.success) {
      throw new Error(result.error || `Unknown error during processing.`);
    }

    // Update status to completed on success.
    await supabase
      .from("files")
      .update({
        processing_status: "completed",
        indexed_chunks: result.numDocs,
        processing_error: null,
      })
      .eq("id", fileId);

    console.log(`${file.type} processed and indexed successfully: ${fileId}`);
    return placeholder;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process ${file.type} ${fileId}:`, errorMessage);

    // Update status to failed on error.
    await supabase
      .from("files")
      .update({
        processing_status: "failed",
        processing_error: errorMessage,
      })
      .eq("id", fileId);

    return `ERROR: ${errorMessage}`;
  }
}

/**
 * Downloads a file's blob content from Supabase storage using the
 * defined path structure: <user_id>/<file_id>.
 *
 * @param supabase An instance of the Supabase client.
 * @param file The file metadata object.
 * @returns A promise that resolves with the file Blob, or null if it fails.
 */
const getFileBlob = async (
  supabase: SupabaseClient,
  file: TypeFile
): Promise<Blob | null> => {
  // Ensure the required IDs are present.
  if (!file.user_id || !file.id) {
    console.error("Cannot get file blob without a user_id and file_id.", file);
    return null;
  }

  // Construct the definitive path.
  const path = `${file.user_id}/${file.id}`;

  console.log(`Attempting to download from definitive storage path: ${path}`);
  const { data, error } = await supabase.storage
    .from("file-storage")
    .download(path);

  if (error) {
    console.error(`Failed to download blob from path: ${path}`, error.message);
    return null;
  }

  return data;
};

/**
 * Retrieves image data as a Buffer for use with Gemini.
 *
 * @param supabase An instance of the Supabase client.
 * @param file The file metadata object.
 * @returns A promise that resolves with the image data, or null on failure.
 */
export const getImageData = async (
  supabase: SupabaseClient,
  file: TypeFile
): Promise<TypeGeminiImageData | null> => {
  try {
    const fileBlob = await getFileBlob(supabase, file);
    if (!fileBlob) {
      throw new Error("Could not download image blob from storage.");
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
