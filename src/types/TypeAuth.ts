import { EnumAuthErrorType } from "@/constants/EnumAuthErrorTypes";

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
  disabled?: boolean;
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
}

export interface TypeAuthHeaderProps {
  title: string;
  subtitle: string;
}

export interface TypeAuthError {
  type: EnumAuthErrorType;
  message: string;
  userMessage: string;
  code?: string;
  retryable: boolean;
  retryAfter?: number;
  context?: Record<string, unknown>;
}

export type TypeUnknownError =
  | Error
  | {
      message?: string;
      error_description?: string;
      error?: string;
      code?: string;
      status?: number;
    }
  | string
  | unknown;


export type TypeAuthAction = "login" | "signup";
export type TypeAuthFormData = TypeLoginFormData | TypeSignupFormData;

export type TypeAuthErrorInfo = {
  type: EnumAuthErrorType;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number;
};