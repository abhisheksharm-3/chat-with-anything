import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthHeader } from "@/components/auth/AuthHeader";

/**
 * Renders the user login page.
 *
 * This component serves as the primary view for user authentication. It integrates
 * the `useAuth` custom hook to manage authentication state (loading, errors) and
 * to handle the form submission logic. The UI includes an integrated header with
 * title and subtitle, a login form, and a link to the signup page.
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Auth Header */}
        <AuthHeader title="Welcome back" subtitle="Sign in to your account to continue" />

        {/* Render the main content - login form */}
        <AuthLoginForm />
        
        <AuthLink
          text="Don't have an account?"
          linkText="Sign up"
          href="/signup"
        />
      </div>
    </div>
  );
};

export default LoginPage;