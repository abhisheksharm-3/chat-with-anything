import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { TypeButtonCta } from "@/types/ui";
import { ArrowRight } from "lucide-react";

/**
 * A reusable call-to-action (CTA) button component.
 * It wraps a shadcn/ui Button within a Next.js Link, providing a simple
 * and consistent way to create styled, linked buttons throughout the application.
 *
 * @component
 * @param {TypeButtonCta} props - The properties for the component.
 * @param {string} [props.label="Get Started"] - The text to display on the button.
 * @param {string} [props.link="#"] - The destination URL for the link.
 * @param {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'} [props.variant="default"] - The visual style variant of the button.
 * @param {'default' | 'sm' | 'lg' | 'icon'} [props.size="lg"] - The size variant of the button.
 * @param {boolean} [props.showArrow=false] - If true, displays a right arrow icon next to the label.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the button.
 * @param {object} [props...props] - Any other props to be spread onto the underlying Button component.
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
    <Link href={link} className="inline-block w-full">
      <Button
        variant={variant}
        size={size}
        className={cn(
          "font-medium cursor-pointer bg-primary hover:bg-primary/80 rounded-lg px-8 py-4 text-base w-full",
          className,
        )}
        {...props}
      >
        {label}
        {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </Link>
  );
};

export default ButtonCta;
