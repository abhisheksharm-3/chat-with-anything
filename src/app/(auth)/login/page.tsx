// src/components/pages/LoginPage.tsx

import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthHeader } from "@/components/auth/AuthHeader";

/**
 * Renders the user login page within a themed "glass" panel.
 * This component structures the header, form, and signup link.
 */
const LoginPage = () => {
  return (
    // The main "glass" container using theme variables for the glass effect
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-border/50 bg-card/20 p-8 shadow-2xl backdrop-blur-lg">
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to access your dashboard"
      />
      <AuthLoginForm />
      <AuthLink
        text="Don't have an account?"
        linkText="Sign up"
        href="/signup"
      />
    </div>
  );
};

export default LoginPage;