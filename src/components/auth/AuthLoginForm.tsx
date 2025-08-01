"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, TypeLoginFormValues } from "../../schemas/AuthSchema";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { useAuth } from "@/hooks/useAuth";
import { JSX } from "react";

// A reusable class string for consistent input styling.
const inputClassName = "h-12 bg-transparent border-border/80 transition-colors focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:ring-primary";

/**
 * @component AuthLoginForm
 * @description Provides a complete user login form with client-side validation,
 * submission handling, and asynchronous feedback (loading/error states).
 *
 * This component utilizes `react-hook-form` for efficient state management and
 * `zod` for robust schema validation. All authentication logic is handled by the
 * `useAuth` custom hook for a clean separation of concerns.
 *
 * @returns {JSX.Element} The rendered login form component.
 */
export const AuthLoginForm = (): JSX.Element => {
  // 1. Set up the form with react-hook-form and Zod.
  const form = useForm<TypeLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange", // Improves UX by validating on input change.
  });

  // 2. Integrate the custom authentication hook for logic and state.
  const {
    handleLogin: onSubmit,
    isLoginLoading: isLoading,
    loginErrorMessage: error,
  } = useAuth();

  return (
    // Wrapper div for layout and a delayed entrance animation.
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
      
      {/* Conditionally render a global error message from the auth hook. */}
      {error && <AuthStatusMessage message={error} type="error" />}

      {/* Form provider from react-hook-form, passing in all form methods. */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* == Email Input Field == */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className={inputClassName}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* == Password Input Field == */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Password</FormLabel>
                <FormControl>
                  <AuthPasswordInput
                    field={field}
                    className={inputClassName}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* == Form Submission Button == */}
          <Button
            type="submit"
            className="h-12 cursor-pointer w-full !mt-8 text-md font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.99]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};