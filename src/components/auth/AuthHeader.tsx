import Link from "next/link";
import { TypeAuthHeaderProps } from "@/types/TypeAuth";

/**
 * @description A clean, left-aligned header for the auth form.
 */
export const AuthHeader: React.FC<TypeAuthHeaderProps> = ({
  title,
  subtitle,
}) => (
  <div className="flex flex-col space-y-2 text-left">
    <Link href="/" className="mb-2">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Inquora
      </h1>
    </Link>
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);