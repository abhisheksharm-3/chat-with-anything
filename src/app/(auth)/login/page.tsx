"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { useAuth } from "@/hooks/useAuth";
import { AuthContainer } from "@/components/auth/AuthContainer";

const LoginPage = () => {
  const { isLoading, errorMessage, handleLogin } = useAuth();

  return (
    <AuthContainer
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      errorMessage={errorMessage}
    >
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      <AuthLink 
        text="Don't have an account?" 
        linkText="Sign up" 
        href="/signup" 
      />
    </AuthContainer>
  );
};

export default LoginPage;