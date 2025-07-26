"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signupSchema, TypeSignupFormValues } from "../../schemas/AuthSchema";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { useAuth } from "@/hooks/useAuth";

/** Shared styling for form inputs to ensure a consistent appearance. */
const inputClassName =
  "bg-[#1a1a1a] border-gray-700 text-white focus-visible:ring-primary";

/**
 * Renders the user registration form.
 *
 * Manages form state with `react-hook-form` and validates input using a Zod schema,
 * including a password confirmation check. It connects to the `useAuth` hook to
 * handle the submission logic, loading state, and display of server-side
 * error or success messages.
 *
 * @returns {JSX.Element} The signup form component.
 */
export const AuthSignupForm = () => {
  const form = useForm<TypeSignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    signupErrorMessage,
    successMessage,
    handleSignup: onSubmit,
    isSignupLoading: isLoading,
  } = useAuth();

  return (
    <>
      {/* Display server-side error message if present */}
      {signupErrorMessage && (
        <AuthStatusMessage message={signupErrorMessage} type="error" />
      )}

      {/* Display success message after registration */}
      {successMessage && (
        <AuthStatusMessage message={successMessage} type="success" />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-300">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-300">
                  Password
                </FormLabel>
                <FormControl>
                  <AuthPasswordInput field={field} className={inputClassName} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <AuthPasswordInput field={field} className={inputClassName} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full py-5 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
