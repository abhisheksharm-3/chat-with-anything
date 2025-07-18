import { useState } from "react";
import { useRouter } from "next/navigation";
import { TypeLoginFormData, TypeSignupFormData } from "@/types/auth";
import { signIn, signUp } from "@/app/(auth)/actions";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export const useAuth = () => {
  const router = useRouter();
  const supabase = supabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (data: TypeLoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signIn(formData);

      if (result) {
        setErrorMessage(result);
      } else {
        router.push("/choose");
      }
    } catch (error) {
      setErrorMessage(`An unexpected error occurred. Please try again. ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: TypeSignupFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("full-name", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signUp(formData);

      if (result) {
        setErrorMessage(result);
      } else {
        // After successful signup, create user profile in the database
        await createUserProfile(data);
        
        setSuccessMessage("Account created successfully! You can now sign in.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(`An unexpected error occurred. Please try again. ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (signupData: TypeSignupFormData) => {
    try {
      // Get the current session to get the user ID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!sessionData.session?.user?.id) {
        throw new Error("No authenticated user found after signup");
      }

      // Create user profile in the users table
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
    } catch (error) {
      console.error("Failed to create user profile:", error);
      // Don't throw here to avoid blocking the signup flow
      // The user can still be created later in useUser hook if needed
    }
  };

  return {
    isLoading,
    errorMessage,
    successMessage,
    handleLogin,
    handleSignup,
  };
};