import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { TypePasswordInputProps } from "@/types/auth";
import { Button } from "../ui/button";

/**
 * Renders a password input field with a toggle to show or hide the password text.
 *
 * This component is designed to integrate with `react-hook-form` by accepting
 * the `field` prop. It enhances user experience for password entry fields.
 *
 * @param {TypePasswordInputProps} props - The component's properties.
 * @param {object} props.field - The field object from `react-hook-form`'s `render` prop.
 * @param {string} [props.placeholder="••••••••"] - Optional placeholder text for the input.
 * @param {string} [props.className=""] - Optional CSS classes to apply to the input element.
 * @returns {React.ReactElement} The rendered password input component.
 */
export const AuthPasswordInput = ({
  field,
  placeholder = "••••••••",
  className = "",
}: TypePasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className={`pr-10 ${className}`}
        {...field}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        // Prevent the button from being focused when tabbing through the form
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff size={16} className="text-gray-400 hover:text-gray-300" />
        ) : (
          <Eye size={16} className="text-gray-400 hover:text-gray-300" />
        )}
      </Button>
    </div>
  );
};
