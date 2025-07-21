"use client";

import { RefreshCw, HelpCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  TypeDetailUploadErrorField,
  TypeUploadError,
  TypeUploadModalErrorProps,
} from "@/types/TypeUpload";
import {
  getUploadErrorColorClasses,
  getUploadErrorIcon,
  getUploadErrorTitle,
} from "@/utils/upload-utils";
import {
  UploadErrorDetailFields,
  UploadErrorHelpConfig,
} from "@/constants/UploadErrorConfig";

/**
 * Enhanced error component that provides contextual error messages, icons, and actions
 * based on the type of error that occurred during upload.
 */
const UploadModalError: React.FC<TypeUploadModalErrorProps> = ({
  error,
  handleRetry,
  canRetry = true,
  isRetrying = false,
  retryCount = 0,
  onContactSupport,
  onDismiss,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const MaxRetries = 3;

  // Parse error object or string
  const errorObj: TypeUploadError | null = (() => {
    if (!error) return null;
    if (typeof error === "string") {
      return {
        type: "unknown",
        message: error,
        retryable: true,
      };
    }
    return error;
  })();

  // Helper function to safely convert unknown error to string
  const getErrorText = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (error === null || error === undefined)
      return "No additional details available";

    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  };

  // Render contextual help message
  const renderHelpMessage = (type: keyof typeof UploadErrorHelpConfig) => {
    const config = UploadErrorHelpConfig[type];
    if (!config) return null;

    return (
      <div
        className={`mt-4 p-3 ${config.bgColor} border ${config.borderColor} rounded-md`}
      >
        <p className={`text-xs ${config.textColor}`}>
          {config.icon} {config.message}
        </p>
      </div>
    );
  };

  // Render detail field
  const renderDetailField = (
    field: TypeDetailUploadErrorField,
    errorObj: TypeUploadError,
    retryCount: number,
  ) => {
    if (field.condition && !field.condition(errorObj, retryCount)) return null;

    const value = field.getValue(errorObj, retryCount);
    if (value === undefined || value === null) return null;

    return (
      <div key={field.key}>
        <span className="font-medium text-gray-700">{field.label}:</span>
        {field.isCodeBlock ? (
          <pre className="ml-2 text-gray-600 font-mono text-xs whitespace-pre-wrap break-words mt-1 p-2 bg-gray-200 rounded">
            {getErrorText(value)}
          </pre>
        ) : (
          <span className={`ml-2 text-gray-600 ${field.className || ""}`}>
            {String(value)}
          </span>
        )}
      </div>
    );
  };

  if (!errorObj) return null;

  const colorClasses = getUploadErrorColorClasses(errorObj.type);
  const shouldShowRetry = canRetry && errorObj.retryable !== false;
  const shouldShowDetails =
    errorObj.originalError || errorObj.type !== "validation";
  const shouldShowSupport =
    (retryCount >= MaxRetries || errorObj.type === "server") &&
    onContactSupport;

  return (
    <div
      className={`relative border border-dashed ${colorClasses.border} ${colorClasses.bg} rounded-lg p-6 text-center mb-4`}
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Error Header */}
      <div className="flex items-center justify-center mb-3">
        {getUploadErrorIcon(errorObj.type)}
        <p className={`text-sm ${colorClasses.titleText} font-medium`}>
          {getUploadErrorTitle(errorObj.type)}
        </p>
      </div>

      {/* Error Message */}
      <div className="mb-4">
        <p className={`text-sm ${colorClasses.messageText} mb-2`}>
          {errorObj.message}
        </p>

        {/* User Action Guidance */}
        {errorObj.userAction && (
          <p
            className={`text-xs ${colorClasses.messageText} opacity-80 italic`}
          >
            💡 {errorObj.userAction}
          </p>
        )}
      </div>

      {/* Retry Information */}
      {retryCount > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            Attempt {retryCount + 1} of {MaxRetries + 1}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
        {/* Retry Button */}
        {shouldShowRetry && (
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying || retryCount >= MaxRetries}
            className="min-w-[100px]"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying
              ? "Retrying..."
              : retryCount > 0
                ? "Try Again"
                : "Retry"}
          </Button>
        )}

        {/* Details Toggle */}
        {shouldShowDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            {showDetails ? "Hide" : "Show"} Details
          </Button>
        )}

        {/* Contact Support */}
        {shouldShowSupport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onContactSupport}
            className="text-blue-500 hover:text-blue-700"
          >
            Contact Support
          </Button>
        )}

        {/* Dismiss Button (alternative placement) */}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            Dismiss
          </Button>
        )}
      </div>

      {/* Error Details (Collapsible) */}
      {showDetails && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md border text-left">
          <div className="text-xs space-y-2">
            {UploadErrorDetailFields.map((field) =>
              renderDetailField(field, errorObj, retryCount),
            )}

            <div className="pt-2 border-t border-gray-300">
              <span className="font-medium text-gray-700">Timestamp:</span>
              <span className="ml-2 text-gray-600">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Help Messages */}
      {(
        Object.keys(UploadErrorHelpConfig) as Array<
          keyof typeof UploadErrorHelpConfig
        >
      )
        .filter((type) => type === errorObj.type)
        .map((type) => renderHelpMessage(type))}

      {/* Max Retries Reached Message */}
      {retryCount >= MaxRetries && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">
            ⚠️ Maximum retry attempts reached. If the problem persists, please
            try a different file or contact support.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadModalError;
