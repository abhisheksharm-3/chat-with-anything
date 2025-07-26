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

/** Shared styling for form inputs to ensure a consistent appearance. */
const inputClassName =
  "bg-[#1a1a1a] border-gray-700 text-white focus-visible:ring-primary";

/**
 * Renders the user login form.
 *
 * Manages form state with `react-hook-form` and validates input using a Zod schema.
 * It connects to the `useAuth` hook to handle the submission logic, loading state,
 * and display of any server-side error messages.
 *
 * @returns {JSX.Element} The login form component.
 */
export const AuthLoginForm = () => {
  const form = useForm<TypeLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleLogin: onSubmit,
    isLoginLoading: isLoading,
    loginErrorMessage,
  } = useAuth();

  return (
    <>
      {/* Display global error message from the API if present */}
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
