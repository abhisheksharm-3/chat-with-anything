import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { TypeButtonCta } from "@/types/TypeUi";
import { ArrowRight } from "lucide-react";

/**
 * A reusable, linked call-to-action (CTA) button.
 * It's a flexible wrapper around the shadcn/ui Button.
 *
 * @component
 * @param {TypeButtonCta} props - The properties for the component.
 * @returns {JSX.Element} The rendered CTA button component.
 */
const ButtonCta = ({
  label = "Get Started",
  link = "#",
  variant = "default",
  size = "lg",
  showArrow = false,
  className,
  ...props
}: TypeButtonCta) => {
  return (
    // The Link wrapper no longer forces full-width by default.
    <Link href={link}>
      <Button
        variant={variant}
        size={size}
        // w-full has been removed from the base classes for better reusability
        className={cn("cursor-pointer px-8 py-4 text-base", className)}
        {...props}
      >
        {label}
        {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </Link>
  );
};

export default ButtonCta;
