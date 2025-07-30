// src/components/auth/AuthLink.tsx

import { TypeAuthLinkProps } from "@/types/TypeAuth";
import Link from "next/link";

/**
 * A themed navigational link for auth pages.
 */
export const AuthLink = ({ text, linkText, href }: TypeAuthLinkProps) => (
  <div className="text-center text-sm">
    <span className="text-muted-foreground">{text}</span>{" "}
    <Link
      href={href}
      className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
    >
      {linkText}
    </Link>
  </div>
);