"use client";
import Link from "next/link";
import ButtonCta from "./ButtonCta";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CtaButtons, PublicNavbarRoutes } from "@/constants/NavItems";
import { cn } from "@/utils/cn";

/**
 * The main responsive navigation bar, styled for the "dark glass" theme.
 *
 * @component
 * @returns {JSX.Element} The rendered navigation bar.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items component
  const NavigationList = ({
    isMobile = false,
    onItemClick,
  }: {
    isMobile?: boolean;
    onItemClick?: () => void;
  }) => (
    <ul
      className={cn(
        isMobile
          ? "space-y-6 text-center"
          : "flex items-center gap-8 justify-center"
      )}
    >
      {PublicNavbarRoutes.map((item, index) => (
        <li key={index}>
          <Link
            href={item.url}
            className={cn(
              "transition-colors duration-300",
              isMobile
                ? "block text-xl font-medium text-neutral-100 hover:text-primary"
                : "relative group text-sm font-medium text-neutral-300 hover:text-neutral-100"
            )}
            onClick={onItemClick}
          >
            {item.label}
            {!isMobile && (
              <span className="absolute left-0 -bottom-1.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  // CTA buttons component with styles matching the "dark glass" theme
  const CTAButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={cn(
        isMobile ? "flex flex-col gap-4 w-full pt-8" : "flex items-center gap-3"
      )}
    >
      {CtaButtons.map(({ label, link, variant }) => (
        <ButtonCta
          key={label}
          label={label}
          link={link}
          size="sm"
          // Apply specific classes based on the button's intended variant
          className={cn(
            "font-semibold rounded-full transition-transform duration-200 hover:scale-105",
            variant === "outline"
              ? "border-white/20 bg-white/10 text-neutral-200 hover:bg-white/20"
              : "bg-neutral-100 text-black hover:bg-neutral-300",
            isMobile && "w-full text-lg py-6" // Larger buttons for mobile
          )}
        />
      ))}
    </div>
  );

  return (
    <header className="fixed top-0 z-50 w-full">
      <div
        className={cn(
          "mx-auto border-b transition-all duration-300",
          // On scroll, apply the "dark glass" style
          scrolled
            ? "bg-black/70 backdrop-blur-md border-white/10"
            : "bg-transparent border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6 lg:px-8">
          {/* Logo with updated colors */}
          <Link href="/" className="flex items-center justify-center">
            <span className="text-2xl font-bold text-neutral-100 transition-colors duration-300 hover:text-primary">
              inquora
            </span>
          </Link>

          {/* Desktop Navigation & CTA */}
          <div className="hidden md:flex items-center gap-8">
            <nav>
              <NavigationList />
            </nav>
            <CTAButtons />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-100 hover:bg-white/10 md:hidden"
            onClick={toggleMenu}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Overlay Menu with "dark glass" background */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeMenu}
          >
            <div className="flex h-full flex-col p-6 pt-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="text-2xl font-bold text-neutral-100"
                  onClick={closeMenu}
                >
                  inquora
                </Link>
                <Button variant="ghost" size="icon" onClick={closeMenu}>
                  <X className="h-6 w-6 text-neutral-100" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center">
                <nav>
                  <NavigationList isMobile onItemClick={closeMenu} />
                </nav>
                <CTAButtons isMobile />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;