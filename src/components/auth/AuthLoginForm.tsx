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
import { loginSchema, TypeLoginFormValues } from "../../schemas/AuthSchema";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { useAuth } from "@/hooks/useAuth";

/**
 * Defines the shared CSS classes for the form's input fields for a consistent look.
 */
const inputClassName =
  "bg-[#1a1a1a] border-gray-700 text-white focus-visible:ring-primary";

/**
 * Renders a user login form with email and password fields.
 *
 * This component uses `react-hook-form` for state management and `zod` for
 * validation. It handles UI state for submission, such as displaying a loader
 * and disabling the submit button. It also displays error messages related to login.
 *
 * @returns {React.ReactElement} The rendered login form.
 */
export const AuthLoginForm = () => {
  const form = useForm<TypeLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleLogin: onSubmit, isLoginLoading: isLoading, loginErrorMessage } = useAuth();

  return (
    <>
      {/* Display error message if present */}
      {loginErrorMessage && (
        <AuthStatusMessage message={loginErrorMessage} type="error" />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormLabel className="text-sm text-gray-300">Password</FormLabel>
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};