import Link from "next/link";
import Image from "next/image";
import { TypeAuthHeaderProps } from "@/types/auth";

/**
 * Renders a standardized header for authentication pages.
 *
 * This component displays the application logo, a primary title, and a subtitle,
 * providing a consistent look for forms like login and signup. The logo links
 * back to the homepage.
 *
 * @param {TypeAuthHeaderProps} props - The component's properties.
 * @param {string} props.title - The main heading text to display.
 * @param {string} props.subtitle - The descriptive text to display below the title.
 * @returns {React.ReactElement} The rendered header component.
 */
export const AuthHeader: React.FC<TypeAuthHeaderProps> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center text-center">
    <Link href="/" className="mb-6">
      <Image
        src="/logo.png"
        alt="Logo"
        width={50}
        height={50}
        className="mx-auto"
        priority
      />
    </Link>
    <h1 className="text-2xl font-bold tracking-tight">
      {title}
    </h1>
    <p className="mt-2 text-sm text-gray-400">
      {subtitle}
    </p>
  </div>
);