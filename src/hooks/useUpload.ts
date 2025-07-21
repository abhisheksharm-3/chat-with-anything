"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFiles } from "@/hooks/useFiles";
import { useChats } from "@/hooks/useChats";
import { useUser } from "@/hooks/useUser";
import { TypeFile, TypeChat } from "@/types/supabase";
import {
  getAllAcceptedFileTypes,
  getFileTypeConfig,
} from "@/constants/FileTypes";
import { getErrorMessage, getUrlType, isValidUrl } from "@/utils/upload-utils";
import {
  TypeUploadError,
  TypeUploadStatus,
  TypeUseUploadLogicProps,
} from "@/types/upload";

/** The maximum number of times to retry chat creation after a successful upload. */
const MaxRetries = 3; // Increased from 2
/** The delay in milliseconds between chat creation retries. */
const RetryDelay = 1500; // Increased from 1000
/** The delay in milliseconds before navigating to the new chat page, to ensure data is ready. */
const NavigationDelay = 1000;
/** Timeout for file upload operations in milliseconds */
const UploadTimeout = 60000; // 60 seconds
/** Maximum file size validation buffer (10% less than actual limit) */
const SizeBufferFactor = 0.9;

/**
 * Enhanced custom hook with comprehensive error handling for file upload modal.
 */
export const useUploadLogic = ({
  fileType,
  onClose,
}: TypeUseUploadLogicProps) => {
  // --- Enhanced State ---
  const [uploadStatus, setUploadStatus] = useState<TypeUploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<TypeUploadError | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // --- Hooks ---
  const router = useRouter();
  const { uploadFileAsync, isUploading, updateFileAsync } = useFiles();
  const { startChatWithFileAsync } = useChats();
  const { isAuthenticated, userId } = useUser();

  // --- Config ---
  const fileTypeConfig = getFileTypeConfig(fileType);
  const acceptedFileTypes = getAllAcceptedFileTypes();

  // --- Enhanced Error Handling Utilities ---

  /**
   * Creates a structured error object with enhanced information
   */
  const createUploadError = useCallback(
    (
      type: TypeUploadError["type"],
      message: string,
      originalError?: unknown,
      retryable = false,
      userAction?: string,
    ): TypeUploadError => {
      console.error(`Upload Error [${type}]:`, message, originalError);

      return {
        type,
        message,
        originalError,
        retryable,
        userAction,
      };
    },
    [],
  );
  /**
   * Enhanced error message extraction with fallbacks
   */
  const getEnhancedErrorMessage = useCallback(
    (err: unknown): TypeUploadError => {
      // Network errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        return createUploadError(
          "network",
          "Network connection failed. Please check your internet connection.",
          err,
          true,
          "Check your internet connection and try again",
        );
      }

      // Timeout errors
      if (err instanceof Error && err.message.includes("timeout")) {
        return createUploadError(
          "network",
          "Upload timed out. The file may be too large or your connection is slow.",
          err,
          true,
          "Try uploading a smaller file or check your connection",
        );
      }

      // Server errors (5xx)
      if (err instanceof Error && err.message.includes("500")) {
        return createUploadError(
          "server",
          "Server error occurred. Our team has been notified.",
          err,
          true,
          "Please try again in a few moments",
        );
      }

      // Authentication errors
      if (
        err instanceof Error &&
        (err.message.includes("401") || err.message.includes("unauthorized"))
      ) {
        return createUploadError(
          "auth",
          "Authentication expired. Please log in again.",
          err,
          false,
          "Please refresh the page and log in again",
        );
      }

      // File processing errors
      if (err instanceof Error && err.message.includes("processing")) {
        return createUploadError(
          "file_processing",
          "Failed to process the file. It may be corrupted or in an unsupported format.",
          err,
          true,
          "Try uploading a different file or check the file format",
        );
      }

      // Validation errors
      if (
        err instanceof Error &&
        (err.message.includes("size") ||
          err.message.includes("type") ||
          err.message.includes("format"))
      ) {
        return createUploadError(
          "validation",
          err.message,
          err,
          false,
          "Please select a different file that meets the requirements",
        );
      }

      // Default case
      const message = getErrorMessage(err);
      return createUploadError(
        "unknown",
        message || "An unexpected error occurred.",
        err,
        true,
        "Please try again or contact support if the problem persists",
      );
    },
    [createUploadError],
  );

  /**
   * Sets error state with enhanced error information
   */
  const setEnhancedError = useCallback(
    (err: unknown) => {
      const enhancedError = getEnhancedErrorMessage(err);
      setError(enhancedError);
      setUploadStatus("error");
    },
    [getEnhancedErrorMessage],
  );

  /** Resets all local states to their initial values. */
  const resetState = useCallback(() => {
    setUploadStatus("idle");
    setFileName("");
    setUrl("");
    setError(null);
    setSelectedFile(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // --- Enhanced Validation Functions ---

  /**
   * Validates file before upload with comprehensive checks
   */
  const validateFile = useCallback(
    (file: File): TypeUploadError | null => {
      // Size validation with buffer
      const maxSizeWithBuffer = fileTypeConfig.maxSize * SizeBufferFactor;
      if (file.size > maxSizeWithBuffer) {
        return createUploadError(
          "validation",
          `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the ${(fileTypeConfig.maxSize / (1024 * 1024)).toFixed(0)}MB limit.`,
          null,
          false,
          "Please select a smaller file",
        );
      }

      // File type validation
      if (
        acceptedFileTypes.length > 0 &&
        !acceptedFileTypes.some((type) => file.type.includes(type))
      ) {
        return createUploadError(
          "validation",
          `File type "${file.type}" is not supported. Allowed types: ${acceptedFileTypes.join(", ")}`,
          null,
          false,
          "Please select a file with a supported format",
        );
      }

      // Empty file check
      if (file.size === 0) {
        return createUploadError(
          "validation",
          "The selected file is empty.",
          null,
          false,
          "Please select a valid file with content",
        );
      }

      // File name validation
      if (file.name.length > 255) {
        return createUploadError(
          "validation",
          "File name is too long (maximum 255 characters).",
          null,
          false,
          "Please rename the file to a shorter name",
        );
      }

      return null;
    },
    [fileTypeConfig, createUploadError],
  );

  /**
   * Validates URL with enhanced checks
   */
  const validateUrl = useCallback(
    (urlToValidate: string): TypeUploadError | null => {
      if (!urlToValidate.trim()) {
        return createUploadError(
          "validation",
          "Please enter a URL.",
          null,
          false,
          "Enter a valid URL starting with http:// or https://",
        );
      }

      if (!isValidUrl(urlToValidate)) {
        return createUploadError(
          "validation",
          "Please enter a valid URL (e.g., https://example.com)",
          null,
          false,
          "Make sure the URL starts with http:// or https://",
        );
      }

      try {
        const parsedUrl = new URL(urlToValidate);

        // Check for suspicious or blocked domains
        const suspiciousDomains = ["localhost", "127.0.0.1", "0.0.0.0"];
        if (
          suspiciousDomains.some((domain) =>
            parsedUrl.hostname.includes(domain),
          )
        ) {
          return createUploadError(
            "validation",
            "Local URLs are not supported.",
            null,
            false,
            "Please use a publicly accessible URL",
          );
        }

        // Protocol validation
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return createUploadError(
            "validation",
            "Only HTTP and HTTPS URLs are supported.",
            null,
            false,
            "Please use a URL starting with http:// or https://",
          );
        }
      } catch (urlError) {
        return createUploadError(
          "validation",
          "Invalid URL format.",
          urlError,
          false,
          "Please check the URL format and try again",
        );
      }

      return null;
    },
    [createUploadError],
  );

  // --- Enhanced UI Handlers ---

  /** Enhanced file change handler with validation */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file immediately
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          setUploadStatus("error");
          return;
        }

        setSelectedFile(file);
        setFileName(file.name);
        setUploadStatus("idle");
        setUrl(""); // Clear URL if a file is selected
        setError(null);
        setRetryCount(0);
      } catch (err) {
        setEnhancedError(err);
      }
    },
    [validateFile, setEnhancedError],
  );

  /** Enhanced URL change handler */
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setUrl(newUrl);

      if (newUrl.trim()) {
        setSelectedFile(null); // Clear file if a URL is being typed
        setFileName("");

        // Real-time URL validation (non-blocking)
        const urlError = validateUrl(newUrl);
        if (urlError && newUrl.length > 10) {
          // Only show error for longer URLs
          setError(urlError);
        } else {
          setError(null);
        }
      }

      if (error) setError(null);
      setRetryCount(0);
    },
    [error, validateUrl],
  );

  /** Enhanced file removal handler */
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileName("");
    setUploadStatus("idle");
    setError(null);
    setRetryCount(0);
  }, []);

  /** Enhanced retry handler */
  const handleRetry = useCallback(() => {
    setUploadStatus("idle");
    setError(null);
    setIsRetrying(false);
    setRetryCount((prev) => prev + 1);
  }, []);

  // --- Enhanced Core Logic Functions ---

  /**
   * Enhanced URL upload with better error handling and timeout
   */
  const handleUrlUpload = useCallback(async (): Promise<TypeFile | null> => {
    const urlValidationError = validateUrl(url);
    if (urlValidationError) {
      setError(urlValidationError);
      setUploadStatus("error");
      return null;
    }

    try {
      const urlType = getUrlType(url, fileType);

      // Enhanced YouTube URL handling
      if (urlType === "youtube") {
        console.log(
          "Processing YouTube URL - transcript availability will be checked server-side",
        );

        // Basic YouTube URL validation
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        if (!youtubeRegex.test(url)) {
          throw new Error("Invalid YouTube URL format");
        }
      }

      const urlFileName = new URL(url).hostname;

      // Add timeout wrapper
      const uploadPromise = uploadFileAsync({
        file: new File([""], urlFileName, { type: "text/plain" }),
        fileData: { name: urlFileName, type: urlType, size: 0 },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Upload timeout - request took too long")),
          UploadTimeout,
        );
      });

      const uploadedFile = await Promise.race([uploadPromise, timeoutPromise]);

      if (!uploadedFile) {
        throw new Error("File upload failed: No file returned from server");
      }

      // Update file with URL
      await updateFileAsync({ fileId: uploadedFile.id, fileData: { url } });
      return uploadedFile;
    } catch (err) {
      console.error("URL upload error:", err);
      setEnhancedError(err);
      return null;
    }
  }, [
    url,
    fileType,
    uploadFileAsync,
    updateFileAsync,
    validateUrl,
    setEnhancedError,
  ]);

  /**
   * Enhanced chat creation with exponential backoff retry
   */
  const createChatWithRetry = useCallback(
    async (fileId: string): Promise<TypeChat | null> => {
      for (let i = 0; i <= MaxRetries; i++) {
        try {
          setIsRetrying(i > 0);

          const newChat = await startChatWithFileAsync(fileId);

          if (!newChat?.id) {
            throw new Error("Chat created but ID is missing");
          }

          setIsRetrying(false);
          return newChat;
        } catch (retryError) {
          console.error(`Chat creation attempt ${i + 1} failed:`, retryError);

          if (i < MaxRetries) {
            const delay = RetryDelay * Math.pow(2, i); // Exponential backoff
            console.log(
              `Retrying chat creation in ${delay}ms (${i + 1}/${MaxRetries})...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            setIsRetrying(false);
            throw createUploadError(
              "chat_creation",
              "Failed to create chat after multiple attempts.",
              retryError,
              true,
              "Please try again or contact support",
            );
          }
        }
      }
      return null;
    },
    [startChatWithFileAsync, createUploadError],
  );

  /**
   * Enhanced main submission handler with comprehensive error handling
   */
  const handleSubmit = useCallback(async () => {
    // Authentication check
    if (!isAuthenticated || !userId) {
      setError(
        createUploadError(
          "auth",
          "You must be logged in to upload files",
          null,
          false,
          "Please log in and try again",
        ),
      );
      setUploadStatus("error");
      return;
    }

    try {
      setUploadStatus("uploading");
      setError(null);
      let uploadedFile: TypeFile | null = null;

      if (selectedFile) {
        // File upload path with validation
        const validationError = validateFile(selectedFile);
        if (validationError) {
          setError(validationError);
          setUploadStatus("error");
          return;
        }

        const uploadPromise = uploadFileAsync({
          file: selectedFile,
          fileData: {
            name: selectedFile.name,
            type: fileType,
            size: selectedFile.size,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("File upload timeout")),
            UploadTimeout,
          );
        });

        uploadedFile = await Promise.race([uploadPromise, timeoutPromise]);
      } else if (url.trim()) {
        // URL upload path
        uploadedFile = await handleUrlUpload();
        if (!uploadedFile) return; // Error is already set within the handler
      } else {
        throw createUploadError(
          "validation",
          "Please select a file or enter a URL",
          null,
          false,
          "Choose a file or enter a valid URL to continue",
        );
      }

      if (!uploadedFile?.id) {
        throw createUploadError(
          "server",
          "File upload failed: Invalid response from server",
          null,
          true,
          "Please try again",
        );
      }

      // Create chat with enhanced retry logic
      const newChat = await createChatWithRetry(uploadedFile.id);
      if (!newChat?.id) {
        throw createUploadError(
          "chat_creation",
          "Failed to create chat: No chat ID returned",
          null,
          true,
          "Please try again",
        );
      }

      setUploadStatus("uploaded");
      onClose();

      // Navigate after delay with error handling
      setTimeout(() => {
        try {
          router.push(`/chat/${newChat.id}`);
        } catch (navError) {
          console.error("Navigation error:", navError);
          // Fallback navigation
          window.location.href = `/chat/${newChat.id}`;
        }
      }, NavigationDelay);
    } catch (err) {
      console.error("Submit error:", err);
      if (err instanceof Error && "type" in err) {
        setError(err as TypeUploadError);
      } else {
        setEnhancedError(err);
      }
      setUploadStatus("error");
    }
  }, [
    isAuthenticated,
    userId,
    selectedFile,
    url,
    fileType,
    uploadFileAsync,
    handleUrlUpload,
    createChatWithRetry,
    onClose,
    router,
    validateFile,
    createUploadError,
    setEnhancedError,
  ]);

  /** Enhanced URL submit handler */
  const handleUrlSubmit = useCallback(() => {
    if (!url.trim()) {
      setError(
        createUploadError(
          "validation",
          "Please enter a URL",
          null,
          false,
          "Enter a valid URL to continue",
        ),
      );
      setUploadStatus("error");
      return;
    }
    handleSubmit();
  }, [url, handleSubmit, createUploadError]);

  /** Enhanced keyboard handler */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleUrlSubmit();
      }
      // Clear error on typing (except for persistent validation errors)
      if (error && error.type !== "validation") {
        setError(null);
      }
    },
    [handleUrlSubmit, error],
  );

  return {
    // State
    uploadStatus,
    fileName,
    url,
    error,
    selectedFile,
    fileTypeConfig,
    isUploading,
    retryCount,
    isRetrying,

    // Handlers
    handleFileChange,
    handleUrlChange,
    handleRemoveFile,
    handleSubmit,
    handleUrlSubmit,
    handleKeyDown,
    handleRetry,
    resetState,

    // Enhanced utilities
    canRetry: error?.retryable ?? false,
    errorType: error?.type,
    userAction: error?.userAction,
  };
};
