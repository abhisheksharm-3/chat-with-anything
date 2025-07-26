import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthSignupForm } from "@/components/auth/AuthSignupForm";

/**
 * Renders the main layout for the user signup page.
 *
 * This component acts as a container, assembling the header, the signup form,
 * and the navigation link to the login page. It does not contain any state or
 * logic itself, delegating those responsibilities to its child components.
 *
 * @returns {JSX.Element} The rendered signup page component.
 */
const SignupPage = () => {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Auth Header */}
      <AuthHeader
        title="Create your account"
        subtitle="Sign up to get started with Chat With Anything"
      />

      {/* Signup Form */}
      <AuthSignupForm />

      {/* Link to Login Page */}
      <AuthLink
        text="Already have an account?"
        linkText="Sign in"
        href="/login"
      />
    </div>
  );
};

export default SignupPage;
