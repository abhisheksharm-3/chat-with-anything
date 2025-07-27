import { TypeAuthError, TypeAuthErrorInfo } from "@/types/TypeAuth";
import { EnumAuthErrorType } from "./EnumAuthErrorTypes";

export const ErrorMessages: Record<string, Partial<TypeAuthError>> = {
  // Supabase Auth errors - ALL KEYS SHOULD BE LOWERCASE
  "invalid login credentials": {
    type: EnumAuthErrorType.AUTHENTICATION_ERROR,
    userMessage:
      "The email or password you entered is incorrect. Please check your credentials and try again.",
    retryable: true,
  },
  "email not confirmed": {
    type: EnumAuthErrorType.AUTHENTICATION_ERROR,
    userMessage:
      "Please check your email and click the confirmation link before signing in.",
    retryable: false,
  },
  "user already registered": {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage:
      "An account with this email already exists. Please try signing in instead.",
    retryable: false,
  },
  "password should be at least 6 characters": {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage: "Your password must be at least 6 characters long.",
    retryable: false,
  },
  "unable to validate email address": {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage: "Please enter a valid email address.",
    retryable: false,
  },
  "email rate limit exceeded": {
    type: EnumAuthErrorType.RATE_LIMIT_ERROR,
    userMessage:
      "Too many attempts. Please wait a few minutes before trying again.",
    retryable: true,
    retryAfter: 300, // 5 minutes
  },
  "signup disabled": {
    type: EnumAuthErrorType.AUTHORIZATION_ERROR,
    userMessage:
      "New account registration is currently unavailable. Please try again later.",
    retryable: true,
  },
  over_email_send_rate_limit: {
    type: EnumAuthErrorType.RATE_LIMIT_ERROR,
    userMessage:
      "Too many emails sent. Please wait before requesting another confirmation email.",
    retryable: true,
    retryAfter: 3600, // 1 hour
  },

  // Network and connectivity errors
  fetch: {
    type: EnumAuthErrorType.NETWORK_ERROR,
    userMessage:
      "Connection problem. Please check your internet connection and try again.",
    retryable: true,
  },
  networkerror: {
    type: EnumAuthErrorType.NETWORK_ERROR,
    userMessage:
      "Network error occurred. Please check your connection and try again.",
    retryable: true,
  },

  // Database errors
  "duplicate key value": {
    type: EnumAuthErrorType.DATABASE_ERROR,
    userMessage: "This account already exists. Please try signing in instead.",
    retryable: false,
  },
  "connection refused": {
    type: EnumAuthErrorType.DATABASE_ERROR,
    userMessage:
      "Unable to connect to our servers. Please try again in a moment.",
    retryable: true,
  },

  // Session errors
  "no authenticated user found": {
    type: EnumAuthErrorType.SESSION_ERROR,
    userMessage: "Authentication failed. Please try signing up again.",
    retryable: true,
  },
};

// Define a shared object for server errors to avoid repetition
const ServerErrorInfo: TypeAuthErrorInfo = {
  type: EnumAuthErrorType.SERVER_ERROR,
  userMessage: "Our servers are experiencing issues. Please try again in a few minutes.",
  retryable: true,
};

/**
 * A map that converts HTTP status codes to structured error information.
 */
export const HttpStatusErrorMap = new Map<number, TypeAuthErrorInfo>([
  [400, {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage: "Please check your input and try again.",
    retryable: false,
  }],
  [401, {
    type: EnumAuthErrorType.AUTHENTICATION_ERROR,
    userMessage: "Authentication failed. Please check your credentials.",
    retryable: true,
  }],
  [403, {
    type: EnumAuthErrorType.AUTHORIZATION_ERROR,
    userMessage: "Access denied. You don't have permission for this action.",
    retryable: false,
  }],
  [429, {
    type: EnumAuthErrorType.RATE_LIMIT_ERROR,
    userMessage: "Too many requests. Please wait a moment and try again.",
    retryable: true,
    retryAfter: 60,
  }],
  [500, ServerErrorInfo],
  [502, ServerErrorInfo],
  [503, ServerErrorInfo],
  [504, ServerErrorInfo],
]);