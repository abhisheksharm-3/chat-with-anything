import { TypeAuthError } from "@/types/TypeAuth";
import { EnumAuthErrorType } from "./EnumAuthErrorTypes";

export const ErrorMessages: Record<string, Partial<TypeAuthError>> = {
  // Supabase Auth errors
  "Invalid login credentials": {
    type: EnumAuthErrorType.AUTHENTICATION_ERROR,
    userMessage:
      "The email or password you entered is incorrect. Please check your credentials and try again.",
    retryable: true,
  },
  "Email not confirmed": {
    type: EnumAuthErrorType.AUTHENTICATION_ERROR,
    userMessage:
      "Please check your email and click the confirmation link before signing in.",
    retryable: false,
  },
  "User already registered": {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage:
      "An account with this email already exists. Please try signing in instead.",
    retryable: false,
  },
  "Password should be at least 6 characters": {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage: "Your password must be at least 6 characters long.",
    retryable: false,
  },
  "Unable to validate email address": {
    type: EnumAuthErrorType.VALIDATION_ERROR,
    userMessage: "Please enter a valid email address.",
    retryable: false,
  },
  "Email rate limit exceeded": {
    type: EnumAuthErrorType.RATE_LIMIT_ERROR,
    userMessage:
      "Too many attempts. Please wait a few minutes before trying again.",
    retryable: true,
    retryAfter: 300, // 5 minutes
  },
  "Signup disabled": {
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
  NetworkError: {
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
  "No authenticated user found": {
    type: EnumAuthErrorType.SESSION_ERROR,
    userMessage: "Authentication failed. Please try signing up again.",
    retryable: true,
  },
};
