import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SettingsDialog from "@/components/dashboard/SettingsDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { NavigationItems } from "@/constants/NavItems";

/**
 * Renders the application logo as a clickable link.
 * Navigates to the '/choose' route on click.
 * @component
 */
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

/**
 * Renders the primary navigation links for the desktop sidebar.
 * It highlights the active link based on the current pathname and includes a settings dialog.
 * @component
 * @param {object} props - The component's properties.
 * @param {string} props.pathname - The current URL pathname to determine the active link.
 */
const DesktopNavigation = ({ pathname }: { pathname: string }) => {
  /**
   * Determines if a navigation item should be highlighted as active
   * @param {string} href - The navigation item's href
   * @param {string} pathname - The current pathname
   * @returns {boolean} - Whether the item should be highlighted
   */
  const isActive = (href: string, pathname: string): boolean => {
    if (href === "/choose") {
      // For /choose, also highlight when on /chat/[id] routes
      return pathname === "/choose" || pathname.startsWith("/chat/");
    }
    // For other routes, exact match
    return pathname === href;
  };

  return (
    <nav className="flex flex-col space-y-2">
      {NavigationItems.map(({ href, icon: IconComponent }) => {
        const LucideIconComponent = IconComponent as LucideIcon;
        return (
          <Link
            key={href}
            href={href}
            className={`p-2 rounded-md transition-colors ${
              isActive(href, pathname)
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
};

/**
 * The main desktop sidebar component for the dashboard.
 * It is vertically arranged, containing the logo, main navigation, and a logout button.
 * This component is hidden on mobile screens.
 * @component
 * @param {object} props - The component's properties.
 * @param {string} props.pathname - The current URL pathname, passed down to the navigation component.
 */
export const DashboardDesktopSidebar = ({ pathname }: { pathname: string }) => (
  <aside className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 bg-[#181818] border border-[#272626] rounded-xl flex-col items-center justify-between py-2 px-2 h-[calc(100vh-1rem)]">
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
