"use client";

import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthSignupForm } from "@/components/auth/AuthSignupForm";
import { useAuth } from "@/hooks/useAuth";

/**
 * Renders the user signup page.
 *
 * This component provides the interface for new users to create an account.
 * It utilizes the `useAuth` custom hook to manage the signup process, including
 * loading states, error messages, and success feedback. The UI consists of a
 * `SignupForm` for user registration details and an `AuthLink` to direct
 * existing users to the login page, all within a consistent `AuthContainer`.
 *
 * @returns {JSX.Element} The rendered signup page component.
 */
const SignupPage = () => {
  /**
   * Destructures state and handlers from the `useAuth` hook.
   * - `isLoading`: A boolean indicating if the signup process is in progress.
   * - `errorMessage`: A string for displaying any signup-related errors.
   * - `successMessage`: A string for displaying a confirmation message upon successful signup.
   * - `handleSignup`: The function to call when the signup form is submitted.
   */
  const { isLoading, errorMessage, successMessage, handleSignup } = useAuth();

  return (
    <AuthContainer
      title="Create your account"
      subtitle="Sign up to get started with Chat With Anything"
      errorMessage={errorMessage}
      successMessage={successMessage}
    >
      <AuthSignupForm onSubmit={handleSignup} isLoading={isLoading} />
      <AuthLink
        text="Already have an account?"
        linkText="Sign in"
        href="/login"
      />
    </AuthContainer>
  );
};

export default SignupPage;