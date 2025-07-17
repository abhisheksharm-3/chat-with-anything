import { useState } from "react";
import { useRouter } from "next/navigation";
import { TypeLoginFormData, TypeSignupFormData } from "@/types/auth";
import { signIn, signUp } from "@/app/(auth)/actions";

export const useAuth = () => {
  const router = useRouter();
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

  return {
    isLoading,
    errorMessage,
    successMessage,
    handleLogin,
    handleSignup,
  };
};