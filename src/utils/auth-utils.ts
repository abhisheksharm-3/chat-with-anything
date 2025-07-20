import { ERROR_MESSAGES } from "@/constants/AuthErrorMessages";
import { AuthErrorType } from "@/constants/EnumAuthErrorTypes";
import { TypeAuthError, TypeUnknownError } from "@/types/auth";

/**
 * Categorizes and enriches error information
 */
export const categorizeAuthError = (error: TypeUnknownError, context?: Record<string, unknown>): TypeAuthError => {
  const errorMessage = (() => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object') {
      const errorObj = error as { message?: string; error_description?: string };
      return errorObj.message || errorObj.error_description || String(error);
    }
    return String(error);
  })();
  
  // Check for known error patterns
  for (const [pattern, errorInfo] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return {
        type: errorInfo.type!,
        message: errorMessage,
        userMessage: errorInfo.userMessage!,
        code: (() => {
          if (error && typeof error === 'object') {
            const errorObj = error as { error?: string; code?: string };
            return errorObj.error || errorObj.code;
          }
          return undefined;
        })(),
        retryable: errorInfo.retryable!,
        retryAfter: errorInfo.retryAfter,
        context
      };
    }
  }

  // Check for HTTP status codes
  const status = (() => {
    if (error && typeof error === 'object') {
      const errorObj = error as { status?: number };
      return errorObj.status;
    }
    return undefined;
  })();

  if (status) {
    switch (status) {
      case 400:
        return {
          type: AuthErrorType.VALIDATION_ERROR,
          message: errorMessage,
          userMessage: 'Please check your input and try again.',
          retryable: false,
          context
        };
      case 401:
        return {
          type: AuthErrorType.AUTHENTICATION_ERROR,
          message: errorMessage,
          userMessage: 'Authentication failed. Please check your credentials.',
          retryable: true,
          context
        };
      case 403:
        return {
          type: AuthErrorType.AUTHORIZATION_ERROR,
          message: errorMessage,
          userMessage: 'Access denied. You don\'t have permission to perform this action.',
          retryable: false,
          context
        };
      case 429:
        return {
          type: AuthErrorType.RATE_LIMIT_ERROR,
          message: errorMessage,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          retryable: true,
          retryAfter: 60,
          context
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: AuthErrorType.SERVER_ERROR,
          message: errorMessage,
          userMessage: 'Our servers are experiencing issues. Please try again in a few minutes.',
          retryable: true,
          context
        };
    }
  }

  // Default unknown error
  return {
    type: AuthErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    retryable: true,
    context
  };
};

  // Shared error handling logic
export const handleAuthErrors = (error: unknown, action: string, context: Record<string, unknown> = {}) => {
    if (error && typeof error === 'object' && 'type' in error) {
      throw error as TypeAuthError;
    }
    
    const categorizedError = categorizeAuthError(error, { action, ...context });
    throw categorizedError;
  };