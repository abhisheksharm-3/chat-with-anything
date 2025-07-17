import Link from "next/link";
import Image from "next/image";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => (
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
    <h1 className="text-2xl font-bold tracking-tight text-white">
      {title}
    </h1>
    <p className="mt-2 text-sm text-gray-400">
      {subtitle}
    </p>
  </div>
);
