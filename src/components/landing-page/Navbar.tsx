import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ButtonCta from "./ButtonCta";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavbarRoutes = [
  { label: "Pricing", url: "/#pricing" },
  { label: "FAQ", url: "/#faq" },
  { label: "Contact Us", url: "/#contact-us" },
];

export default function Navbar() {
  return (
    <div className="w-full">
      <div className="mx-auto flex items-center justify-between py-10 px-24">
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

        {/* Desktop CTA Buttons - Right */}
        <div className="hidden md:flex flex-shrink-0 gap-5">
          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex">
            <ul className="flex items-center gap-6 justify-center">
              {NavbarRoutes.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.url}
                    className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2.5">
            <ButtonCta
              label="Login"
              link="/login"
              variant="outline"
              className="text-primary-foreground"
            />
            <ButtonCta
              label="Try For Free"
              link="/signup"
              variant="default"
              className="text-primary-foreground"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col h-full justify-between py-6">
              <nav>
                <ul className="grid gap-4 py-6">
                  {NavbarRoutes.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.url}
                        className="text-sm font-medium hover:text-foreground/80 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-col gap-2.5">
                <ButtonCta
                  label="Login"
                  link="/login"
                  variant="outline"
                  className="w-full text-primary-foreground"
                />
                <ButtonCta
                  label="Try For Free"
                  link="/signup"
                  variant="default"
                  className="w-full text-primary-foreground"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
