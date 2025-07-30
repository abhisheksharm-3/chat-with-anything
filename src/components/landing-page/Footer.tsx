import Link from "next/link";

/**
 * A footer component updated for Inquora's branding and cohesive UI.
 *
 * It displays the current copyright notice and provides styled links to legal pages,
 * matching the site's overall "dark glass" theme.
 *
 * @component
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-8 text-center">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 text-sm text-neutral-400">
        {/* Updated copyright with current year and brand name */}
        <span>© {new Date().getFullYear()} inquora. All rights reserved.</span>

        <div className="flex items-center gap-6">
            <Link href="/terms" className="transition-colors hover:text-neutral-100">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-neutral-100">
              Privacy Policy
            </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;