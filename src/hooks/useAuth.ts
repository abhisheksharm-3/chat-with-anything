"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  TypeAuthError,
  TypeLoginFormData,
  TypeSignupFormData,
} from "@/types/TypeAuth";
import { signIn, signUp } from "@/app/(auth)/actions";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { EnumAuthErrorType } from "@/constants/EnumAuthErrorTypes";
import { categorizeAuthError, handleAuthErrors } from "@/utils/auth-utils";

/**
 * A custom hook to manage user authentication processes like login and signup.
 * It uses React Query's `useMutation` to handle asynchronous operations,
 * state management (loading, error, success), and server-side actions.
 *
 * @returns {object} An object containing state variables and handler functions for authentication.
 */
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();

  // Shared mutation configuration
  const createMutationConfig = (action: "login" | "signup") => ({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      if (action === "login") {
        router.push("/choose");
      } else {
        setTimeout(() => router.push("/login"), 2000);
      }
    },
    onError: (error: TypeAuthError) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          `${action.charAt(0).toUpperCase() + action.slice(1)} error:`,
          {
            type: error.type,
            message: error.message,
            userMessage: error.userMessage,
            context: error.context,
            retryable: error.retryable,
          },
        );
      }
    },
    retry: (failureCount: number, error: TypeAuthError) => {
      const maxRetries = action === "login" ? 3 : 2;

      if (!error.retryable || failureCount >= maxRetries) {
        return false;
      }

      // Don't retry specific error types
      const nonRetryableTypes = [EnumAuthErrorType.RATE_LIMIT_ERROR];
      if (action === "signup") {
        nonRetryableTypes.push(
          EnumAuthErrorType.VALIDATION_ERROR,
          EnumAuthErrorType.USER_CREATION_ERROR,
        );
      }

      return !nonRetryableTypes.includes(error.type);
    },
    retryDelay: (attemptIndex: number, error?: TypeAuthError) => {
      const baseDelay = 1000;
      const delay = baseDelay * Math.pow(2, attemptIndex);

      if (error?.type === EnumAuthErrorType.NETWORK_ERROR) {
        return delay + Math.random() * 1000;
      }

      return delay;
    },
  });

  // Shared form data preparation
  const prepareFormData = (
    data: TypeLoginFormData | TypeSignupFormData,
    type: "login" | "signup",
  ) => {
    const formData = new FormData();

    if (type === "login") {
      const loginData = data as TypeLoginFormData;
      formData.append("email", loginData.email);
      formData.append("password", loginData.password);
    } else {
      const signupData = data as TypeSignupFormData;
      formData.append("full-name", signupData.fullName);
      formData.append("email", signupData.email);
      formData.append("password", signupData.password);
    }

    return formData;
  };

  /**
   * Creates a user profile in the public 'users' table after a successful signup.
   * This is necessary because Supabase's `auth.users` table is private.
   * @param {TypeSignupFormData} signupData - The user's signup data, including email and full name.
   * @returns {Promise<object|null>} The created user profile object or null if an error occurs.
   */
  const createUserProfile = async (signupData: TypeSignupFormData) => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        const categorizedError = categorizeAuthError(sessionError, {
          action: "getSession",
          step: "createUserProfile",
        });
        throw categorizedError;
      }

      if (!sessionData.session?.user?.id) {
        const error = categorizeAuthError(
          new Error("No authenticated user found after signup"),
          {
            action: "validateSession",
            step: "createUserProfile",
            sessionExists: !!sessionData.session,
            userExists: !!sessionData.session?.user,
          },
        );
        throw error;
      }

      const defaultUser = {
        id: sessionData.session.user.id,
        email: signupData.email,
        name: signupData.fullName,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert(defaultUser);

      if (insertError) {
        const categorizedError = categorizeAuthError(insertError, {
          action: "insertUser",
          step: "createUserProfile",
          userId: sessionData.session.user.id,
          userEmail: signupData.email,
        });
        throw categorizedError;
      }

      return defaultUser;
    } catch (error) {
      if (error && typeof error === "object" && "type" in error) {
        throw error as TypeAuthError;
      }

      const categorizedError = categorizeAuthError(error, {
        action: "createUserProfile",
        step: "general",
      });
      categorizedError.type = EnumAuthErrorType.USER_CREATION_ERROR;
      categorizedError.userMessage =
        "Your account was created but we couldn't complete the setup. Please contact support.";
      throw categorizedError;
    }
  };

  /**
   * Mutation for handling user login.
   * It calls the `signIn` server action and manages success/error states.
   */
  const loginMutation = useMutation({
    mutationFn: async (data: TypeLoginFormData) => {
      try {
        const formData = prepareFormData(data, "login");
        const result = await signIn(formData);

        if (result) {
          const categorizedError = categorizeAuthError(result, {
            action: "signIn",
            email: data.email,
          });
          throw categorizedError;
        }

        return { success: true };
      } catch (error) {
        handleAuthErrors(error, "signIn", { email: data.email });
      }
    },
    ...createMutationConfig("login"),
  });

  /**
   * Mutation for handling user signup.
   * It calls the `signUp` server action and then creates a user profile.
   */
  const signupMutation = useMutation({
    mutationFn: async (data: TypeSignupFormData) => {
      try {
        const formData = prepareFormData(data, "signup");
        const result = await signUp(formData);

        if (result) {
          const categorizedError = categorizeAuthError(result, {
            action: "signUp",
            email: data.email,
            fullName: data.fullName,
          });
          throw categorizedError;
        }

        const userProfile = await createUserProfile(data);
        return { success: true, userProfile };
      } catch (error) {
        handleAuthErrors(error, "signUp", {
          email: data.email,
          fullName: data.fullName,
        });
      }
    },
    ...createMutationConfig("signup"),
  });

  // Shared error getter utility
  const getErrorFromMutation = (
    mutation: typeof loginMutation | typeof signupMutation,
  ): TypeAuthError | null => {
    const error = mutation.error;
    return error && typeof error === "object" && "type" in error
      ? (error as TypeAuthError)
      : null;
  };

  /**
   * Triggers the login mutation with the provided form data.
   * @param {TypeLoginFormData} data - The user's login credentials.
   */
  const handleLogin = (data: TypeLoginFormData) => {
    loginMutation.mutate(data);
  };

  /**
   * Triggers the signup mutation with the provided form data.
   * @param {TypeSignupFormData} data - The user's signup details.
   */
  const handleSignup = (data: TypeSignupFormData) => {
    signupMutation.mutate(data);
  };

  /**
   * Checks if an error is retryable after a certain period
   */
  const canRetryAfter = (error: TypeAuthError | null): number | null => {
    if (!error?.retryable || !error.retryAfter) {
      return null;
    }
    return error.retryAfter * 1000; // Convert to milliseconds
  };

  const loginError = getErrorFromMutation(loginMutation);
  const signupError = getErrorFromMutation(signupMutation);

  return {
    /** A general loading state, true if either login or signup is pending. */
    isLoading: loginMutation.isPending || signupMutation.isPending,

    // Login specific state
    /** The enhanced error information from the login mutation. */
    loginError,
    /** The user-friendly error message for login. */
    loginErrorMessage: loginError?.userMessage || null,
    /** True if the login mutation was successful. */
    loginSuccess: loginMutation.isSuccess,
    /** True if the login mutation is currently pending. */
    isLoginLoading: loginMutation.isPending,
    /** True if the login error is retryable. */
    isLoginRetryable: loginError?.retryable || false,

    // Signup specific state
    /** The enhanced error information from the signup mutation. */
    signupError,
    /** The user-friendly error message for signup. */
    signupErrorMessage: signupError?.userMessage || null,
    /** True if the signup mutation was successful. */
    signupSuccess: signupMutation.isSuccess,
    /** True if the signup mutation is currently pending. */
    isSignupLoading: signupMutation.isPending,
    /** True if the signup error is retryable. */
    isSignupRetryable: signupError?.retryable || false,
    /** A success message displayed after successful signup. */
    successMessage: signupMutation.isSuccess
      ? "Account created successfully! You can now sign in."
      : null,

    // Actions
    /** Function to initiate the login process. */
    handleLogin,
    /** Function to initiate the signup process. */
    handleSignup,

    // Reset functions
    /** Resets the state of the login mutation (error, success, etc.). */
    resetLoginState: () => loginMutation.reset(),
    /** Resets the state of the signup mutation. */
    resetSignupState: () => signupMutation.reset(),

    // Enhanced error utilities
    /** Returns the retry delay in milliseconds for the current error, if applicable. */
    getRetryDelay: () =>
      canRetryAfter(loginError) || canRetryAfter(signupError),

    /** Gets detailed error context for debugging. */
    getErrorContext: () => loginError?.context || signupError?.context || null,

    /** Gets the current error type for conditional handling. */
    getCurrentErrorType: (): EnumAuthErrorType | null =>
      loginError?.type || signupError?.type || null,
  };
};
