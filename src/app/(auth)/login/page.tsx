"use client";

import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { useAuth } from "@/hooks/useAuth";
import { AuthContainer } from "@/components/auth/AuthContainer";

/**
 * Renders the user login page.
 *
 * This component serves as the primary view for user authentication. It integrates
 * the `useAuth` custom hook to manage authentication state (loading, errors) and
 * to handle the form submission logic. The UI is composed of a `LoginForm`
 * for user credentials and an `AuthLink` for navigation to the signup page,
 * all wrapped within a consistent `AuthContainer`.
 *
 * @returns {JSX.Element} The rendered login page component.
 */
const LoginPage = () => {
  /**
   * Destructures state and handlers from the `useAuth` hook.
   * - `isLoading`: A boolean to indicate if the login process is active.
   * - `errorMessage`: A string containing any login-related error messages.
   * - `handleLogin`: The function to execute upon form submission.
   */
  const { isLoading, loginErrorMessage, handleLogin } = useAuth();

  return (
    <AuthContainer
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      errorMessage={loginErrorMessage}
    >
      <AuthLoginForm onSubmit={handleLogin} isLoading={isLoading} />
      <AuthLink
        text="Don't have an account?"
        linkText="Sign up"
        href="/signup"
      />
    </AuthContainer>
  );
};

export default LoginPage;
