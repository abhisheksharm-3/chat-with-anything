import { TypeAuthContainerProps } from "@/types/auth";
import { AuthHeader } from "./AuthHeader";
import { StatusMessage } from "./StatusMessage";

export const AuthContainer = ({
  title,
  subtitle,
  children,
  errorMessage,
  successMessage,
}: TypeAuthContainerProps) => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <div className="w-full max-w-md space-y-8">
      <AuthHeader title={title} subtitle={subtitle} />

      {errorMessage && <StatusMessage message={errorMessage} type="error" />}
      {successMessage && <StatusMessage message={successMessage} type="success" />}

      {children}
    </div>
  </div>
);
