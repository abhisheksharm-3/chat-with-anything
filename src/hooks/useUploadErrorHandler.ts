"use client";

import { useCallback } from "react";
import { getErrorMessage, UploadAction } from "@/utils/upload-utils";
import { TypeUploadError } from "@/types/TypeUpload";
import { EnumUploadActionType } from "@/constants/EnumUploadData";

/** A map of regular expressions to error types for categorizing errors by their message. */
const errorTypeMap = new Map<RegExp, TypeUploadError['type']>([
  [/fetch/i, 'network'],
  [/timeout/i, 'network'],
  [/5\d{2}/, 'server'],
  [/401|unauthorized/i, 'auth'],
  [/processing/i, 'file_processing'],
  [/size|type|format/i, 'validation'],
]);

/**
 * @typedef {object} UseUploadErrorHandlerReturn
 * @property {(type: TypeUploadError["type"], message: string, originalError?: unknown, retryable?: boolean) => TypeUploadError} createUploadError - A factory function to build a structured upload error object.
 * @property {(err: unknown) => void} setUploadError - A function that categorizes an unknown error and dispatches it to the upload state reducer.
 */

/**
 * A custom hook that provides centralized error handling logic for an upload process.
 *
 * It offers memoized utility functions to create, categorize, and dispatch
 * structured error objects to a `useReducer` state manager.
 *
 * @param {React.Dispatch<UploadAction>} dispatch - The dispatch function from a `useReducer` hook that manages the upload state.
 * @returns {UseUploadErrorHandlerReturn} An object containing the error handling utility functions.
 */
export const useUploadErrorHandler = (dispatch: React.Dispatch<UploadAction>) => {
  /**
   * Creates a structured error object and logs it to the console.
   * This function is memoized for performance.
   */
  const createUploadError = useCallback(
    (
      type: TypeUploadError["type"],
      message: string,
      originalError?: unknown,
      retryable = false
    ): TypeUploadError => {
      console.error(`Upload Error [${type}]:`, message, originalError);
      return { type, message, originalError, retryable };
    },
    []
  );

  /**
   * Categorizes an unknown error by matching its message against predefined patterns.
   * @private
   */
  const getCategorizedError = useCallback((err: unknown): TypeUploadError => {
    const message = getErrorMessage(err);
    for (const [pattern, type] of errorTypeMap.entries()) {
      if (pattern.test(message)) {
        // Automatically set retryable to false for validation and auth errors.
        const isRetryable = type !== 'validation' && type !== 'auth';
        return createUploadError(type, message, err, isRetryable);
      }
    }
    // Default to an "unknown" error type, which is considered retryable.
    return createUploadError("unknown", message, err, true);
  }, [createUploadError]);

  /**
   * Takes an unknown error, categorizes it, and dispatches it to the reducer.
   * This is the primary function to be called from a `catch` block.
   */
  const setUploadError = useCallback((err: unknown) => {
    const categorizedError = getCategorizedError(err);
    dispatch({ type: EnumUploadActionType.SET_ERROR, payload: categorizedError });
  }, [dispatch, getCategorizedError]);

  return { createUploadError, setUploadError };
};