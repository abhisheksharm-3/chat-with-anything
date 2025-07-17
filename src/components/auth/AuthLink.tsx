import { TypeAuthLinkProps } from "@/types/auth";
import Link from "next/link";

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
