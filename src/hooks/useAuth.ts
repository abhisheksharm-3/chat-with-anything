import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TypeAuthError, TypeLoginFormData, TypeSignupFormData } from "@/types/auth";
import { signIn, signUp } from "@/app/(auth)/actions";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { AuthErrorType } from "@/constants/EnumAuthErrorTypes";
import { categorizeAuthError } from "@/utils/auth-utils";

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

  /**
   * Creates a user profile in the public 'users' table after a successful signup.
   * This is necessary because Supabase's `auth.users` table is private.
   * @param {TypeSignupFormData} signupData - The user's signup data, including email and full name.
   * @returns {Promise<object|null>} The created user profile object or null if an error occurs.
   */
  const createUserProfile = async (signupData: TypeSignupFormData) => {
    try {
      // Get the current session to retrieve the newly created user's ID
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        const categorizedError = categorizeAuthError(sessionError, { 
          action: 'getSession',
          step: 'createUserProfile'
        });
        throw categorizedError;
      }

      if (!sessionData.session?.user?.id) {
        const error = categorizeAuthError(
          new Error("No authenticated user found after signup"),
          { 
            action: 'validateSession',
            step: 'createUserProfile',
            sessionExists: !!sessionData.session,
            userExists: !!sessionData.session?.user
          }
        );
        throw error;
      }

      // Prepare the user profile data for insertion
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
          action: 'insertUser',
          step: 'createUserProfile',
          userId: sessionData.session.user.id,
          userEmail: signupData.email
        });
        throw categorizedError;
      }

      return defaultUser;
    } catch (error) {
      // If it's already a categorized error, re-throw it
      if (error && typeof error === 'object' && 'type' in error) {
        throw error as TypeAuthError;
      }
      
      // Otherwise, categorize the unknown error
      const categorizedError = categorizeAuthError(error, {
        action: 'createUserProfile',
        step: 'general'
      });
      categorizedError.type = AuthErrorType.USER_CREATION_ERROR;
      categorizedError.userMessage = 'Your account was created but we couldn\'t complete the setup. Please contact support.';
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
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        const result = await signIn(formData);

        if (result) {
          const categorizedError = categorizeAuthError(result, {
            action: 'signIn',
            email: data.email
          });
          throw categorizedError;
        }

        return { success: true };
      } catch (error) {
        // If it's already a categorized error, re-throw it
        if (error && typeof error === 'object' && 'type' in error) {
          throw error as TypeAuthError;
        }
        
        // Categorize unknown errors
        const categorizedError = categorizeAuthError(error, {
          action: 'signIn',
          email: data.email
        });
        throw categorizedError;
      }
    },
    onSuccess: () => {
      // On success, invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      router.push("/choose");
    },
    onError: (error: TypeAuthError) => {
      if(process.env.NODE_ENV !== 'production') {
        console.error("Login error:", {
          type: error.type,
          message: error.message,
          userMessage: error.userMessage,
          context: error.context,
          retryable: error.retryable
        });
      }
    },
    retry: (failureCount: number, error: TypeAuthError) => {
      // Only retry if the error is retryable and we haven't exceeded max attempts
      if (error.retryable && failureCount < 3) {
        // For rate limit errors, respect the retryAfter period
        if (error.type === AuthErrorType.RATE_LIMIT_ERROR && error.retryAfter) {
          return false; // Don't auto-retry rate limit errors
        }
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex: number, error: TypeAuthError) => {
      // Exponential backoff: 1s, 2s, 4s
      const baseDelay = 1000;
      const delay = baseDelay * Math.pow(2, attemptIndex);
      
      // For network errors, add some jitter
      if (error.type === AuthErrorType.NETWORK_ERROR) {
        return delay + Math.random() * 1000;
      }
      
      return delay;
    }
  });

  /**
   * Mutation for handling user signup.
   * It calls the `signUp` server action and then creates a user profile.
   */
  const signupMutation = useMutation({
    mutationFn: async (data: TypeSignupFormData) => {
      try {
        const formData = new FormData();
        formData.append("full-name", data.fullName);
        formData.append("email", data.email);
        formData.append("password", data.password);

        const result = await signUp(formData);

        if (result) {
          const categorizedError = categorizeAuthError(result, {
            action: 'signUp',
            email: data.email,
            fullName: data.fullName
          });
          throw categorizedError;
        }

        // After successful signup, create the user profile in the database
        const userProfile = await createUserProfile(data);

        return { success: true, userProfile };
      } catch (error) {
        // If it's already a categorized error, re-throw it
        if (error && typeof error === 'object' && 'type' in error) {
          throw error as TypeAuthError;
        }
        
        // Categorize unknown errors
        const categorizedError = categorizeAuthError(error, {
          action: 'signUp',
          email: data.email,
          fullName: data.fullName
        });
        throw categorizedError;
      }
    },
    onSuccess: () => {
      // Invalidate queries to ensure fresh data on next load
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Redirect to login page after a short delay to show success message
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: TypeAuthError) => {
      if(process.env.NODE_ENV !== 'production') {
        console.error("Signup error:", {
          type: error.type,
          message: error.message,
          userMessage: error.userMessage,
          context: error.context,
          retryable: error.retryable
        });
      }
    },
    retry: (failureCount: number, error: TypeAuthError) => {
      // Only retry if the error is retryable and we haven't exceeded max attempts
      if (error.retryable && failureCount < 2) {
        // Don't retry validation errors or user creation errors
        if (error.type === AuthErrorType.VALIDATION_ERROR || 
            error.type === AuthErrorType.USER_CREATION_ERROR ||
            error.type === AuthErrorType.RATE_LIMIT_ERROR) {
          return false;
        }
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex: number) => {
      // Shorter delays for signup (1s, 2s)
      return 1000 * Math.pow(2, attemptIndex);
    }
  });

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
   * Gets the current login error with enhanced information
   */
  const getLoginError = (): TypeAuthError | null => {
    const error = loginMutation.error;
    return error && typeof error === 'object' && 'type' in error ? error as TypeAuthError : null;
  };

  /**
   * Gets the current signup error with enhanced information
   */
  const getSignupError = (): TypeAuthError | null => {
    const error = signupMutation.error;
    return error && typeof error === 'object' && 'type' in error ? error as TypeAuthError : null;
  };

  /**
   * Checks if an error is retryable after a certain period
   */
  const canRetryAfter = (error: TypeAuthError | null): number | null => {
    if (!error || !error.retryable || !error.retryAfter) {
      return null;
    }
    return error.retryAfter * 1000; // Convert to milliseconds
  };

  return {
    /** A general loading state, true if either login or signup is pending. */
    isLoading: loginMutation.isPending || signupMutation.isPending,

    // Login specific state
    /** The enhanced error information from the login mutation. */
    loginError: getLoginError(),
    /** The user-friendly error message for login. */
    loginErrorMessage: getLoginError()?.userMessage || null,
    /** True if the login mutation was successful. */
    loginSuccess: loginMutation.isSuccess,
    /** True if the login mutation is currently pending. */
    isLoginLoading: loginMutation.isPending,
    /** True if the login error is retryable. */
    isLoginRetryable: getLoginError()?.retryable || false,

    // Signup specific state
    /** The enhanced error information from the signup mutation. */
    signupError: getSignupError(),
    /** The user-friendly error message for signup. */
    signupErrorMessage: getSignupError()?.userMessage || null,
    /** True if the signup mutation was successful. */
    signupSuccess: signupMutation.isSuccess,
    /** True if the signup mutation is currently pending. */
    isSignupLoading: signupMutation.isPending,
    /** True if the signup error is retryable. */
    isSignupRetryable: getSignupError()?.retryable || false,

    // Legacy compatibility (deprecated but maintained for backward compatibility)
    /** @deprecated Use loginErrorMessage or signupErrorMessage instead */
    errorMessage: getLoginError()?.userMessage || getSignupError()?.userMessage || null,
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
    getRetryDelay: () => {
      const loginError = getLoginError();
      const signupError = getSignupError();
      return canRetryAfter(loginError) || canRetryAfter(signupError);
    },
    
    /** Gets detailed error context for debugging. */
    getErrorContext: () => {
      const loginError = getLoginError();
      const signupError = getSignupError();
      return loginError?.context || signupError?.context || null;
    },

    /** Gets the current error type for conditional handling. */
    getCurrentErrorType: (): AuthErrorType | null => {
      const loginError = getLoginError();
      const signupError = getSignupError();
      return loginError?.type || signupError?.type || null;
    }
  };
};