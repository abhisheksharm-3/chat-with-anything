import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLink } from "@/components/auth/AuthLink";
import { AuthSocialLogins } from "@/components/auth/AuthSocialLogins";
import { JSX } from "react";

const LoginPage = (): JSX.Element => {
  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col gap-6 rounded-xl border border-border/50 bg-card/50 p-8 backdrop-blur-lg">
        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to continue to your dashboard"
        />
        <AuthSocialLogins />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or with Email
            </span>
          </div>
        </div>
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