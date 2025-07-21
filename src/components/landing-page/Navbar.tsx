"use client";
import Link from "next/link";
import Image from "next/image";
import ButtonCta from "./ButtonCta";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CtaButtons, PublicNavbarRoutes } from "@/constants/NavItems";

/**
 * The main responsive navigation bar for the application's landing page.
 *
 * This client component manages its own state to provide a standard horizontal
 * layout on desktop screens and a full-screen overlay menu on mobile devices.
 *
 * @component
 * @returns {JSX.Element} The rendered navigation bar.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Navigation items component
  const NavigationList = ({
    isMobile = false,
    onItemClick,
  }: {
    isMobile?: boolean;
    onItemClick?: () => void;
  }) => (
    <ul
      className={
        isMobile ? "space-y-8" : "flex items-center gap-6 justify-center"
      }
    >
      {PublicNavbarRoutes.map((item, index) => (
        <li key={index}>
          <Link
            href={item.url}
            className={
              isMobile
                ? "block text-2xl font-semibold hover:text-foreground/80 transition-colors"
                : "text-sm text-foreground/80 hover:text-foreground transition-colors"
            }
            onClick={onItemClick}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  // CTA buttons component
  const CTAButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={isMobile ? "flex flex-col gap-4" : "flex items-center gap-2.5"}
    >
      {CtaButtons.map(({ label, link, variant }) => (
        <ButtonCta
          key={label}
          label={label}
          link={link}
          variant={variant}
          className={isMobile ? "text-lg py-3" : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="mx-auto flex items-center justify-between py-6 px-6 lg:py-10 lg:px-28">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Logo"
            className="object-contain"
            width={44}
            height={40}
            priority
          />
          <span className="text-foreground font-semibold text-xl">
            chat with anything
          </span>
        </Link>

        {/* Desktop Navigation & CTA */}
        <div className="hidden md:flex flex-shrink-0 gap-5">
          <nav className="hidden md:flex">
            <NavigationList />
          </nav>
          <CTAButtons />
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden flex-shrink-0"
          onClick={toggleMenu}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-background/95 backdrop-blur-sm"
            onClick={closeMenu}
          >
            <div className="flex flex-col items-center justify-center h-full px-6">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                className="absolute top-6 right-6 h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>

              {/* Navigation */}
              <nav className="text-center">
                <NavigationList isMobile onItemClick={closeMenu} />
              </nav>

              {/* CTA Buttons */}
              <div className="mt-12 w-full max-w-xs">
                <CTAButtons isMobile />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
