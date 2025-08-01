import { AuthSignupForm } from "@/components/auth/AuthSignupForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthSocialLogins } from "@/components/auth/AuthSocialLogins";
import { JSX } from "react";

/**
 * @description Renders the signup page with a compact layout that requires
 * no scrolling on standard screen sizes.
 */
const SignupPage = (): JSX.Element => {
  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-700 lg:max-w-md">
      <div className="flex flex-col gap-5 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-lg">
        <AuthHeader
          title="Create Your Account"
          subtitle="Join Inquora to turn data into clarity."
        />
        <AuthSocialLogins />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or Sign Up With Email
            </span>
          </div>
        </div>
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