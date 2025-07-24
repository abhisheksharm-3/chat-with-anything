/**
 * Upload utility functions
 */

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol.startsWith("http");
  } catch {
    return false;
  }
};

export const getUrlType = (url: string, fileType: string): string => {
  if (
    fileType === "youtube" ||
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) {
    return "youtube";
  }
  return "web";
};

export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return "An unknown error occurred";

  const { message } = error;

  if (message.includes("NEXT_REDIRECT")) {
    return ""; // Not actually an error
  }

  if (message.includes("new row violates row-level security policy")) {
    return "Permission denied: You do not have permission to upload files. Please check that you are properly logged in.";
  }

  if (message.includes("JWT")) {
    return "Your session has expired. Please log in again.";
  }

  if (message.includes("bucket")) {
    return "Storage error: The file storage system is not properly configured.";
  }

  return message;
};


// Get error title based on type
export const getUploadErrorTitle = (type: string) => {
  switch (type) {
    case "validation":
      return "Invalid Input";
    case "network":
      return "Connection Failed";
    case "server":
      return "Server Error";
    case "auth":
      return "Authentication Required";
    case "file_processing":
      return "File Processing Failed";
    case "chat_creation":
      return "Chat Creation Failed";
    default:
      return "Upload Failed";
  }
};

// Get border and background colors based on error type
export const getUploadErrorColorClasses = (type: string) => {
  if (type === "validation") {
    return {
      border: "border-amber-500",
      bg: "bg-amber-50",
      titleText: "text-amber-700",
      messageText: "text-amber-600",
    };
  }
  return {
    border: "border-red-500",
    bg: "bg-red-50",
    titleText: "text-red-700",
    messageText: "text-red-600",
  };
};
