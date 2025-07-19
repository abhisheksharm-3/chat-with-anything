import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TypeLoginFormData, TypeSignupFormData } from "@/types/auth";
import { signIn, signUp } from "@/app/(auth)/actions";
import { supabaseBrowserClient } from "@/utils/supabase/client";

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

      if (sessionError) throw sessionError;

      if (!sessionData.session?.user?.id) {
        throw new Error("No authenticated user found after signup");
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
        console.error("Error creating user profile:", insertError);
        throw insertError;
      }

      return defaultUser;
    } catch (error) {
      console.error("Failed to create user profile:", error);
      // Return null instead of throwing to avoid blocking the main signup flow.
      return null;
    }
  };

  /**
   * Mutation for handling user login.
   * It calls the `signIn` server action and manages success/error states.
   */
  const loginMutation = useMutation({
    mutationFn: async (data: TypeLoginFormData) => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signIn(formData);

      if (result) {
        throw new Error(result); // Throw an error if signIn returns an error message
      }

      return { success: true };
    },
    onSuccess: () => {
      // On success, invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      router.push("/choose");
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  /**
   * Mutation for handling user signup.
   * It calls the `signUp` server action and then creates a user profile.
   */
  const signupMutation = useMutation({
    mutationFn: async (data: TypeSignupFormData) => {
      const formData = new FormData();
      formData.append("full-name", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signUp(formData);

      if (result) {
        throw new Error(result); // Throw an error if signUp returns an error message
      }

      // After successful signup, create the user profile in the database
      const userProfile = await createUserProfile(data);

      return { success: true, userProfile };
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
    onError: (error) => {
      console.error("Signup error:", error);
    },
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

  return {
    /** A general loading state, true if either login or signup is pending. */
    isLoading: loginMutation.isPending || signupMutation.isPending,

    // Login specific state
    /** The error message from the login mutation, or null if no error. */
    loginError: loginMutation.error?.message || null,
    /** True if the login mutation was successful. */
    loginSuccess: loginMutation.isSuccess,
    /** True if the login mutation is currently pending. */
    isLoginLoading: loginMutation.isPending,

    // Signup specific state
    /** The error message from the signup mutation, or null if no error. */
    signupError: signupMutation.error?.message || null,
    /** True if the signup mutation was successful. */
    signupSuccess: signupMutation.isSuccess,
    /** True if the signup mutation is currently pending. */
    isSignupLoading: signupMutation.isPending,

    // Legacy compatibility messages
    /** A combined error message from either mutation. */
    errorMessage:
      loginMutation.error?.message || signupMutation.error?.message || null,
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
  };
};
