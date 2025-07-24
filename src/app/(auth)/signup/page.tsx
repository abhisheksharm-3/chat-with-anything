import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthSignupForm } from "@/components/auth/AuthSignupForm";

/**
 * Renders the user signup page.
 *
 * This component provides the interface for new users to create an account.
 * It utilizes the `useAuth` custom hook to manage the signup process, including
 * loading states, error messages, and success feedback. The UI includes an 
 * integrated header with title and subtitle, a signup form, and a link to 
 * direct existing users to the login page.
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Auth Header */}
        <AuthHeader title="Create your account" subtitle="Sign up to get started with Chat With Anything" />

        {/* Render the main content - signup form */}
        <AuthSignupForm />
        
        <AuthLink
          text="Already have an account?"
          linkText="Sign in"
          href="/login"
        />
      </div>
    </div>
  );
};

export default SignupPage;