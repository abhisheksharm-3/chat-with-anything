// src/components/auth/AuthSignupForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signupSchema, TypeSignupFormValues } from "../../schemas/AuthSchema";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { useAuth } from "@/hooks/useAuth";

// Reusable input styling using theme variables (border, primary for focus).
const inputClassName =
  "h-12 bg-transparent border-border transition-colors focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:ring-primary";

/**
 * Themed user signup form with validation and submission handling.
 */
export const AuthSignupForm = () => {
  const form = useForm<TypeSignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const {
    signupErrorMessage,
    successMessage,
    handleSignup: onSubmit,
    isSignupLoading: isLoading,
  } = useAuth();

  return (
    <>
      {signupErrorMessage && (
        <AuthStatusMessage message={signupErrorMessage} type="error" />
      )}
      {successMessage && (
        <AuthStatusMessage message={successMessage} type="success" />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className={inputClassName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ... other form fields would follow the same pattern ... */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-muted-foreground">Email</FormLabel>
                <FormControl>
                    <Input placeholder="you@example.com" className={inputClassName} {...field} />
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
                <FormLabel className="text-muted-foreground">Password</FormLabel>
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
                <FormLabel className="text-muted-foreground">Confirm Password</FormLabel>
                <FormControl>
                    <AuthPasswordInput field={field} className={inputClassName} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
          <Button
            type="submit"
            className="h-12 w-full !mt-8 text-md font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};