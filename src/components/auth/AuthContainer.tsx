import { TypeAuthContainerProps } from "@/types/TypeAuth";
import { AuthHeader } from "./AuthHeader";
import { AuthStatusMessage } from "./AuthStatusMessage";

/**
 * A reusable container component for authentication forms.
 *
 * This component provides a consistent layout for pages like login, signup,
 * and password reset. It includes a header, optional status messages (for errors or successes),
 * and a placeholder for the form content itself.
 *
 * @param {TypeAuthContainerProps} props - The properties for the component.
 * @param {string} props.title - The main title to display in the header.
 * @param {string} props.subtitle - The subtitle to display below the main title.
 * @param {React.ReactNode} props.children - The form or other content to be rendered inside the container.
 * @param {string | null | undefined} props.errorMessage - An optional error message to display.
 * @param {string | null | undefined} props.successMessage - An optional success message to display.
 * @returns {React.ReactElement} The rendered authentication container.
 */
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

      {/* Conditionally render status messages */}
      {errorMessage && (
        <AuthStatusMessage message={errorMessage} type="error" />
      )}
      {successMessage && (
        <AuthStatusMessage message={successMessage} type="success" />
      )}

      {/* Render the main content, such as a login or signup form */}
      {children}
    </div>
  </div>
);
