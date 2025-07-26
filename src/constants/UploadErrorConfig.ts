import {
  TypeDetailUploadErrorField,
  TypeUploadError,
} from "@/types/TypeUpload";

export const UploadErrorHelpConfig = {
  auth: {
    icon: "🔒",
    message:
      "Your session may have expired. Please refresh the page and log in again.",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  network: {
    icon: "🌐",
    message:
      "Check your internet connection and try again. Large files may require a stable connection.",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
  },
  validation: {
    icon: "📋",
    message:
      "Please check the file requirements and ensure your file meets all criteria.",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
  },
} as const;

export // Configuration for detail fields
const UploadErrorDetailFields: TypeDetailUploadErrorField[] = [
  {
    key: "type",
    label: "Error Type",
    getValue: (error: TypeUploadError) => error.type,
    className: "font-mono",
  },
  {
    key: "retryCount",
    label: "Retry Attempts",
    getValue: (error: TypeUploadError, retryCount?: number) => retryCount,
    condition: (error: TypeUploadError, retryCount?: number) =>
      (retryCount ?? 0) > 0,
  },
  {
    key: "originalError",
    label: "Technical Details",
    getValue: (error: TypeUploadError) => error.originalError,
    condition: (error: TypeUploadError) => !!error.originalError,
    isCodeBlock: true,
  },
];
