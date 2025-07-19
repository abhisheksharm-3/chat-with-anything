"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFiles } from "@/hooks/useFiles";
import { useChats } from "@/hooks/useChats";
import { useUser } from "@/hooks/useUser";
import { TypeFile, TypeChat } from "@/types/supabase";
import { getFileTypeConfig } from "@/constants/FileTypes";
import { getErrorMessage, getUrlType, isValidUrl } from "@/utils/upload-utils";
import { TypeUseUploadLogicProps } from "@/types/types";

export type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

/** The maximum number of times to retry chat creation after a successful upload. */
const MAX_RETRIES = 2;
/** The delay in milliseconds between chat creation retries. */
const RETRY_DELAY = 1000;
/** The delay in milliseconds before navigating to the new chat page, to ensure data is ready. */
const NAVIGATION_DELAY = 1000;

/**
 * A custom hook that encapsulates the entire business logic for the file upload modal.
 * It manages the upload state machine, handles file/URL selection, validation,
 * the multi-step upload and processing flow, and subsequent chat creation with retries.
 *
 * @param {TypeUseUploadLogicProps} props - The properties for the hook.
 * @param {string} props.fileType - The type of file being uploaded (e.g., 'pdf', 'youtube').
 * @param {() => void} props.onClose - A callback function to close the parent modal.
 * @returns {object} An object containing all the state and handlers needed by the UI.
 * @property {UploadStatus} uploadStatus - The current status of the upload process.
 * @property {string} fileName - The name of the selected file.
 * @property {string} url - The URL input value.
 * @property {string} error - The current error message.
 * @property {File | null} selectedFile - The selected File object.
 * @property {object} fileTypeConfig - Configuration for the current file type.
 * @property {boolean} isUploading - True if an upload is in progress (from `useFiles`).
 * @property {function} handleFileChange - Handler for file input changes.
 * @property {function} handleUrlChange - Handler for URL input changes.
 * @property {function} handleRemoveFile - Handler to deselect a file.
 * @property {function} handleSubmit - The main handler to start the upload process.
 * @property {function} handleUrlSubmit - Convenience handler to submit a URL.
 * @property {function} handleKeyDown - Handler for keyboard events in the URL input.
 * @property {function} handleRetry - Handler to reset the error state and allow a retry.
 * @property {function} resetState - Function to reset the hook's internal state.
 */
export const useUploadLogic = ({
  fileType,
  onClose,
}: TypeUseUploadLogicProps) => {
  // --- State ---
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Hooks ---
  const router = useRouter();
  const { uploadFileAsync, isUploading, updateFileAsync } = useFiles();
  const { startChatWithFileAsync } = useChats();
  const { isAuthenticated, userId } = useUser();

  // --- Config ---
  const fileTypeConfig = getFileTypeConfig(fileType);

  /** Resets all local states to their initial values. */
  const resetState = useCallback(() => {
    setUploadStatus("idle");
    setFileName("");
    setUrl("");
    setError("");
    setSelectedFile(null);
  }, []);

  // --- Handlers for UI interactions ---

  /** Handles the selection of a local file from the input. */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setFileName(file.name);
        setUploadStatus("idle");
        setUrl(""); // Clear URL if a file is selected
        setError("");
      }
    },
    [],
  );

  /** Handles changes to the URL input field. */
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setUrl(newUrl);
      if (newUrl.trim()) {
        setSelectedFile(null); // Clear file if a URL is being typed
        setFileName("");
      }
      if (error) setError("");
    },
    [error],
  );

  /** Deselects the currently chosen file. */
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileName("");
    setUploadStatus("idle");
  }, []);

  /** Resets the error state to allow the user to try again. */
  const handleRetry = useCallback(() => {
    setUploadStatus("idle");
    setError("");
  }, []);

  // --- Core Logic Functions ---

  /**
   * Handles the specific logic for uploading content from a URL.
   * This includes validation, special checks for services like YouTube,
   * and creating the file record in the database.
   * @returns {Promise<TypeFile | null>} The created file object or null on failure.
   */
  const handleUrlUpload = useCallback(async (): Promise<TypeFile | null> => {
    if (!isValidUrl(url)) {
      setUploadStatus("error");
      setError("Please enter a valid URL (e.g., https://example.com)");
      return null;
    }

    try {
      const urlType = getUrlType(url, fileType);

      // Special check for YouTube to verify transcript availability before proceeding
      if (urlType === "youtube") {
        const { checkYoutubeTranscriptAvailability } = await import(
          "@/utils/gemini/youtube-utils"
        );
        const { available, error: transcriptError } =
          await checkYoutubeTranscriptAvailability(url);
        if (!available) {
          throw new Error(
            `Cannot process this YouTube video: ${
              transcriptError || "No transcript available."
            }`,
          );
        }
      }

      const urlFileName = new URL(url).hostname;
      const uploadedFile = await uploadFileAsync({
        file: new File([""], urlFileName, { type: "text/plain" }),
        fileData: { name: urlFileName, type: urlType, size: 0 },
      });

      if (uploadedFile) {
        await updateFileAsync({ fileId: uploadedFile.id, fileData: { url } });
      }
      return uploadedFile;
    } catch (err) {
      console.error("URL upload error:", err);
      setUploadStatus("error");
      setError(getErrorMessage(err));
      return null;
    }
  }, [url, fileType, uploadFileAsync, updateFileAsync]);

  /**
   * A robust wrapper for creating a chat that includes a retry mechanism.
   * This helps handle potential race conditions where the file processing might not
   * be complete before the chat creation is attempted.
   * @param {string} fileId - The ID of the file to associate with the new chat.
   * @returns {Promise<TypeChat | null>} The newly created chat object or null on failure.
   */
  const createChatWithRetry = useCallback(
    async (fileId: string): Promise<TypeChat | null> => {
      for (let i = 0; i <= MAX_RETRIES; i++) {
        try {
          const newChat = await startChatWithFileAsync(fileId);
          if (!newChat?.id) throw new Error("Chat created but ID is missing");
          return newChat;
        } catch (retryError) {
          if (i < MAX_RETRIES) {
            console.log(`Retrying chat creation (${i + 1}/${MAX_RETRIES})...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          } else {
            throw retryError;
          }
        }
      }
      return null;
    },
    [startChatWithFileAsync],
  );

  /**
   * The main submission handler that orchestrates the entire upload and chat creation process.
   */
  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setError("You must be logged in to upload files");
      setUploadStatus("error");
      return;
    }

    try {
      setUploadStatus("uploading");
      let uploadedFile: TypeFile | null = null;

      if (selectedFile) {
        // Handle file upload
        if (selectedFile.size > fileTypeConfig.maxSize) {
          throw new Error(
            `File size exceeds ${
              fileTypeConfig.maxSize / (1024 * 1024)
            }MB limit`,
          );
        }
        uploadedFile = await uploadFileAsync({
          file: selectedFile,
          fileData: {
            name: selectedFile.name,
            type: fileType,
            size: selectedFile.size,
          },
        });
      } else if (url.trim()) {
        // Handle URL upload
        uploadedFile = await handleUrlUpload();
        if (!uploadedFile) return; // Error is already set within the handler
      } else {
        throw new Error("Please select a file or enter a URL");
      }

      if (!uploadedFile?.id)
        throw new Error("File upload failed: Invalid response from server");

      // Create chat associated with the uploaded file
      const newChat = await createChatWithRetry(uploadedFile.id);
      if (!newChat?.id)
        throw new Error("Failed to create chat: No chat ID returned");

      setUploadStatus("uploaded");
      onClose();

      // Navigate after a delay to ensure all states are settled
      setTimeout(() => router.push(`/chat/${newChat.id}`), NAVIGATION_DELAY);
    } catch (err) {
      console.error("Submit error:", err);
      setUploadStatus("error");
      setError(getErrorMessage(err));
    }
  }, [
    isAuthenticated,
    userId,
    selectedFile,
    url,
    fileType,
    fileTypeConfig,
    uploadFileAsync,
    handleUrlUpload,
    createChatWithRetry,
    onClose,
    router,
  ]);

  /** Convenience handler to submit the URL from the input's send button. */
  const handleUrlSubmit = useCallback(() => {
    if (url.trim()) handleSubmit();
  }, [url, handleSubmit]);

  /** Convenience handler to submit the URL when the Enter key is pressed. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleUrlSubmit();
      }
    },
    [handleUrlSubmit],
  );

  return {
    uploadStatus,
    fileName,
    url,
    error,
    selectedFile,
    fileTypeConfig,
    isUploading,
    handleFileChange,
    handleUrlChange,
    handleRemoveFile,
    handleSubmit,
    handleUrlSubmit,
    handleKeyDown,
    handleRetry,
    resetState,
  };
};
