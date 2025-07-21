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
import { signupSchema, TypeSignupFormValues } from "../../schemas/auth";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { TypeSignupFormProps } from "@/types/TypeAuth";

/**
 * Defines shared CSS classes for the form's input fields to ensure a consistent style.
 */
const inputClassName =
  "bg-[#1a1a1a] border-gray-700 text-white focus-visible:ring-primary";

/**
 * Renders a user registration form with fields for full name, email, and password.
 *
 * This component leverages `react-hook-form` for form state management and `zod`
 * for validation, including a check to ensure the password and confirm password fields match.
 * It also handles the UI loading state during form submission.
 *
 * @param {TypeSignupFormProps} props - The component's properties.
 * @param {(values: TypeSignupFormValues) => void} props.onSubmit - The callback function to execute upon successful form validation and submission.
 * @param {boolean} props.isLoading - If true, the form is disabled and a loading indicator is shown on the submit button.
 * @returns {React.ReactElement} The rendered signup form.
 */
export const AuthSignupForm: React.FC<TypeSignupFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const form = useForm<TypeSignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-300">Full Name</FormLabel>
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
              <FormLabel className="text-sm text-gray-300">Password</FormLabel>
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
  );
};
