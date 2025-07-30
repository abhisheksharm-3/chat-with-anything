// src/app/(auth)/signup/page.tsx

import { AuthSignupForm } from "@/components/auth/AuthSignupForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthHeader } from "@/components/auth/AuthHeader";

/**
 * Renders the user signup page within a themed "glass" panel.
 */
const SignupPage = () => {
  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-black/20 p-8 shadow-2xl shadow-black/40 backdrop-blur-lg">
      <AuthHeader
        title="Create an Account"
        subtitle="Start your journey with Inquora today"
      />
      <AuthSignupForm />
      <AuthLink text="Already have an account?" linkText="Sign in" href="/login" />
    </div>
  );
};

export default SignupPage;