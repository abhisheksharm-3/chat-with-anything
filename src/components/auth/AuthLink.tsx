import { TypeAuthLinkProps } from "@/types/auth";
import Link from "next/link";

/**
 * Renders a navigational link typically used on authentication pages.
 *
 * This component creates a prompt with a clickable link, for example:
 * "Don't have an account? Sign up".
 *
 * @param {TypeAuthLinkProps} props - The component's properties.
 * @param {string} props.text - The static text to display before the link.
 * @param {string} props.linkText - The text for the clickable link.
 * @param {string} props.href - The URL destination for the link.
 * @returns {React.ReactElement} The rendered link component.
 */
export const AuthLink = ({ text, linkText, href }: TypeAuthLinkProps) => (
  <div className="mt-6 text-center text-sm">
    <span className="text-gray-400">{text}</span>{" "}
    <Link
      href={href}
      className="font-medium text-primary hover:text-primary/90"
    >
      {linkText}
    </Link>
  </div>
);