"use client";

import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthLink } from "@/components/auth/AuthLink";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";

const SignupPage = () => {
  const { isLoading, errorMessage, successMessage, handleSignup } = useAuth();

  return (
    <AuthContainer
      title="Create your account"
      subtitle="Sign up to get started with Chat With Anything"
      errorMessage={errorMessage}
      successMessage={successMessage}
    >
      <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
      <AuthLink 
        text="Already have an account?" 
        linkText="Sign in" 
        href="/login" 
      />
    </AuthContainer>
  );
};

export default SignupPage;