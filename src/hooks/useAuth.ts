"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TypeAuthAction, TypeAuthError, TypeAuthFormData, TypeLoginFormData, TypeSignupFormData } from "@/types/TypeAuth";
import { signIn, signUp } from "@/app/(auth)/actions";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { EnumAuthErrorType } from "@/constants/EnumAuthErrorTypes";
import { categorizeAuthError, handleAuthErrors } from "@/utils/auth-utils";

// Type for server action functions
type ServerActionFunction = (formData: FormData) => Promise<string | undefined>;

/**
 * A custom hook to manage user authentication processes like login and signup.
 *
 * It uses React Query's `useMutation` to handle asynchronous operations,
 * state management (loading, error, success), and server-side actions. It provides
 * detailed error objects and separate states for login and signup flows.
 */
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Private Helper Functions ---

  /** Invalidates all user-related queries to refetch fresh data after an auth change. @private */
  const _invalidateAuthQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  /** Handles navigation after a successful login or signup. @private */
  const _handleSuccessNavigation = (action: TypeAuthAction) => {
    if (action === "login") {
      router.push("/choose");
    } else {
      // For signup, show a success message before redirecting to login.
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  /** Prepares form data for server actions. @private */
  const _prepareFormData = (data: TypeAuthFormData, type: TypeAuthAction): FormData => {
    const formData = new FormData();
    // All auth forms have email and password
    formData.append("email", data.email);
    formData.append("password", data.password);
    // Signup has an additional full name field
    if (type === "signup") {
      formData.append("full-name", (data as TypeSignupFormData).fullName);
    }
    return formData;
  };

  /**
   * Creates a user profile in the public 'users' table after a successful signup.
   * This is a critical step to make user data accessible to the application.
   * @private
   */
  const _createUserProfile = async (signupData: TypeSignupFormData, userId: string) => {
    try {
      const userProfile = {
        id: userId,
        email: signupData.email,
        name: signupData.fullName,
      };
      const { error: insertError } = await supabaseBrowserClient().from("users").insert(userProfile);
      if (insertError) throw insertError;
      return userProfile;
    } catch (error) {
      // This is a critical error. The user is created in auth but not in the public table.
      const categorizedError = categorizeAuthError(error, { action: "createUserProfile" });
      categorizedError.type = EnumAuthErrorType.USER_CREATION_ERROR;
      categorizedError.userMessage = "Your account was created but setup failed. Please contact support.";
      throw categorizedError;
    }
  };
  
  /** Executes the server action for login or signup and handles errors. @private */
  const _executeAuthAction = async (
    data: TypeAuthFormData,
    action: TypeAuthAction,
    serverAction: ServerActionFunction
  ) => {
    try {
      const formData = _prepareFormData(data, action);
      const result = await serverAction(formData);

      // Server actions return an error object on failure, otherwise null/undefined.
      if (result) {
        throw result;
      }
      return { success: true };
    } catch (error) {
      // Standardize the error and re-throw for the mutation to catch.
      handleAuthErrors(error, action, { email: data.email });
    }
  };

  // --- MUTATIONS ---

  /** Mutation for handling the user login process. */
  const loginMutation = useMutation({
    mutationFn: (data: TypeLoginFormData) => _executeAuthAction(data, "login", signIn),
    onSuccess: () => {
      _invalidateAuthQueries();
      _handleSuccessNavigation("login");
    },
    onError: (error) => console.error("Login mutation failed:", error),
  });

  /** Mutation for handling the user signup process, including profile creation. */
  const signupMutation = useMutation({
    mutationFn: async (data: TypeSignupFormData) => {
      await _executeAuthAction(data, "signup", signUp);
      
      // After successful signup, get the new user's ID to create their profile.
      const { data: { session }, error } = await supabaseBrowserClient().auth.getSession();
      if (error || !session?.user.id) {
        throw categorizeAuthError(error || "No user session found after signup.", { action: "getSession" });
      }
      
      const userProfile = await _createUserProfile(data, session.user.id);
      return { success: true, userProfile };
    },
    onSuccess: () => {
      // Do not invalidate queries here, as the user is not logged in yet.
      _handleSuccessNavigation("signup");
    },
    onError: (error) => console.error("Signup mutation failed:", error),
  });

  // --- Derived State and Return Object ---

  const loginError = loginMutation.error as TypeAuthError | null;
  const signupError = signupMutation.error as TypeAuthError | null;

  return {
    // General
    isLoading: loginMutation.isPending || signupMutation.isPending,

    // Login
    handleLogin: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginSuccess: loginMutation.isSuccess,
    loginError,
    loginErrorMessage: loginError?.userMessage || null,
    resetLoginState: loginMutation.reset,

    // Signup
    handleSignup: signupMutation.mutate,
    isSignupLoading: signupMutation.isPending,
    signupSuccess: signupMutation.isSuccess,
    signupError,
    signupErrorMessage: signupError?.userMessage || null,
    resetSignupState: signupMutation.reset,
    successMessage: signupMutation.isSuccess
      ? "Account created! Please check your email to verify and then sign in."
      : null,
  };
};