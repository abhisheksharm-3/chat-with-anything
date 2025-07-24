import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthHeader } from "@/components/auth/AuthHeader";

/**
 * Renders the layout for the user login page.
 *
 * This component acts as a presentational container, arranging the header,
 * login form, and a link to the signup page. It does not manage state or
 * handle logic itself; those responsibilities are delegated to child
 * components like `AuthLoginForm`.
 *
 * @returns {JSX.Element} The rendered login page component.
 */
const LoginPage = () => {
  return (
      <div className="w-full max-w-md space-y-8">
        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to your account to continue"
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