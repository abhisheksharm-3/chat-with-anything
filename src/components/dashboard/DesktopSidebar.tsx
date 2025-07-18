import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SettingsDialog from "@/components/dashboard/SettingsDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { NAVIGATION_ITEMS } from "@/constants/NavItems";

const Logo = () => (
  <Link href="/choose">
    <Image
      src="/logo.png"
      alt="Logo"
      className="object-contain"
      width={32}
      height={32}
      priority
    />
  </Link>
);

const DesktopNavigation = ({ pathname }: { pathname: string }) => (
  <nav className="flex flex-col space-y-2">
    {NAVIGATION_ITEMS.map(({ href, icon: IconComponent }) => {
      const LucideIconComponent = IconComponent as LucideIcon;
      return (
        <Link
          key={href}
          href={href}
          className={`p-2 rounded-md transition-colors ${
            pathname === href
              ? "text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LucideIconComponent size={20} />
        </Link>
      );
    })}
    <SettingsDialog
      trigger={
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground cursor-pointer">
          <Settings size={20} />
        </button>
      }
    />
  </nav>
);

export const DesktopSidebar = ({ pathname }: { pathname: string }) => (
  <aside className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 bg-[#181818] rounded-xl flex-col items-center justify-between py-2 px-2 h-[calc(100vh-1rem)]">
    <Logo />
    <DesktopNavigation pathname={pathname} />
    <LogoutDialog
      trigger={
        <button className="p-2 rounded-md text-muted-foreground hover:text-destructive cursor-pointer">
          <LogOut size={20} />
        </button>
      }
    />
  </aside>
);