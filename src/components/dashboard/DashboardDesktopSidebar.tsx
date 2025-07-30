// src/components/dashboard/DashboardDesktopSidebar.tsx

"use client";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { NavigationItems } from "@/constants/NavItems";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DesktopNavigation = () => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href === "/dashboard" && pathname.startsWith("/chat"));

  return (
    <nav className="flex flex-col items-center gap-2">
      {NavigationItems.map(({ href, icon: Icon, title }) => (
        <Tooltip key={href}>
          <TooltipTrigger asChild>
            <Link
              href={href}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                isActive(href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
};

export const DashboardDesktopSidebar = () => (
  <aside className="hidden md:flex h-full w-16 flex-col items-center justify-between border-r border-white/10 bg-black/30 py-5 backdrop-blur-md">
    <TooltipProvider delayDuration={0}>
      <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center transition-transform hover:scale-110">
        <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
      </Link>
      <DesktopNavigation />
      <LogoutDialog
        trigger={
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        }
      />
    </TooltipProvider>
  </aside>
);