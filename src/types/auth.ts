import { LoginFormValues, SignupFormValues } from "@/schemas/auth";

export interface TypeLoginFormData {
  email: string;
  password: string;
}
export interface TypeSignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface TypeStatusMessageProps {
  message: string;
  type: "error" | "success";
}

export interface TypePasswordInputProps {
  field: React.InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string;
  className?: string;
}

export interface TypeLoginFormProps {
  onSubmit: (data: LoginFormValues) => void;
  isLoading: boolean;
}

export interface TypeSignupFormProps {
  onSubmit: (data: SignupFormValues) => void;
  isLoading: boolean;
}

export interface TypeAuthLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export interface TypeAuthContainerProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  errorMessage?: string | null;
  successMessage?: string | null;
}