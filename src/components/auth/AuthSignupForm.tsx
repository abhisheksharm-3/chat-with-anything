"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signupSchema, TypeSignupFormValues } from "../../schemas/AuthSchema";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { useAuth } from "@/hooks/useAuth";
import { JSX } from "react";

// Use a slightly smaller height for inputs to save space
const inputClassName = "h-10 bg-transparent border-border/80 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:ring-primary";

/**
 * @description A compact signup form that arranges fields in a 2x2 grid to
 * prevent vertical overflow on smaller screens.
 */
export const AuthSignupForm = (): JSX.Element => {
  const form = useForm<TypeSignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const { handleSignup: onSubmit, isSignupLoading: isLoading, signupErrorMessage: error, successMessage } = useAuth();

  return (
    <>
      {error && <AuthStatusMessage message={error} type="error" />}
      {successMessage ? (
        <AuthStatusMessage message={successMessage} type="success" />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Main 2x2 Grid for all input fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className={inputClassName} disabled={isLoading} {...field} />
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
                    <FormLabel className="text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" className={inputClassName} disabled={isLoading} {...field} />
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
                      <AuthPasswordInput field={field} className={inputClassName} disabled={isLoading} />
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
                    <FormLabel className="text-muted-foreground">Confirm</FormLabel>
                    <FormControl>
                      <AuthPasswordInput field={field} className={inputClassName} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full !mt-6 h-10" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Create Account"}
            </Button>
          </form>
        </Form>
      )}
    </>
      )}