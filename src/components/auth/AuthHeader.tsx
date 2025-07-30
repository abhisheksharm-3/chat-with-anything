// src/components/auth/AuthHeader.tsx

import Link from "next/link";
import { TypeAuthHeaderProps } from "@/types/TypeAuth";

/**
 * A standardized header for auth pages, using theme-aware text colors.
 */
export const AuthHeader: React.FC<TypeAuthHeaderProps> = ({
  title,
  subtitle,
}) => (
  <div className="flex flex-col items-center justify-center text-center">
    {/* Brand name as a stylized link */}
    <Link href="/" className="mb-6">
      <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground transition-transform duration-300 hover:scale-105">
        Inquora
      </h1>
    </Link>

    {/* Page-specific title and subtitle */}
    <h2 className="text-3xl font-bold tracking-tight text-foreground">
      {title}
    </h2>
    <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
  </div>
);