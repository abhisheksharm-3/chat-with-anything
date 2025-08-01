// src/components/auth/AuthLink.tsx

import type { TypeAuthLinkProps } from "@/types/TypeAuth";
import Link from "next/link";
import { JSX } from "react";

/**
 * @component AuthLink
 * @description Renders a themed navigational link for auth pages, typically used
 * to direct users to an alternative action like signing up or signing in.
 *
 * @param {TypeAuthLinkProps} props - The component props.
 * @param {string} props.text - The static text that precedes the link (e.g., "Don't have an account?").
 * @param {string} props.linkText - The clickable text for the link itself (e.g., "Sign up").
 * @param {string} props.href - The destination path for the link (e.g., "/signup").
 *
 * @returns {JSX.Element} The rendered link component with a final entrance animation.
 */
export const AuthLink = ({
  text,
  linkText,
  href,
}: TypeAuthLinkProps): JSX.Element => (
  // Container with a delayed animation to appear last on the auth card.
  // `fill-mode-backwards` ensures it starts as invisible before the animation begins.
  <div className="text-center text-sm animate-in fade-in duration-700 delay-300 fill-mode-backwards">
    {/* Static, non-interactive text part */}
    <span className="text-muted-foreground">{text} </span>

    {/* The main interactive link with improved accessibility and hover effects */}
    <Link
      href={href}
      className="rounded-sm font-medium text-primary underline-offset-4 transition-all duration-300 hover:text-primary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {linkText}
    </Link>
  </div>
);