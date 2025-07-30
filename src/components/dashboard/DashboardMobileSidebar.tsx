// src/components/dashboard/DashboardMobileSidebar.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingDialog from "@/components/dashboard/PricingDialog";
import { MobileNavItems } from "@/constants/NavItems";
import { TypeUser } from "@/types/TypeSupabase";
import { useUser } from "@/hooks/useUser";
import avatarImage from "@/assets/images/avatar.svg";
import { useSidebarState } from "@/hooks/useMobileSidebarState";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";

const MobileNavigation = ({ onItemClick }: { onItemClick: () => void }) => {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-4">
      <div className="space-y-2">
        {MobileNavItems.map(({ href, icon: Icon, title, description }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
                onClick={onItemClick}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-card ${isActive ? "text-primary" : ""}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{title}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
              </Link>
            );
          })}
      </div>
    </nav>
  );
};

const UserProfile = ({ user, isLoading }: { user: TypeUser | null | undefined; isLoading: boolean; }) => {
  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <Image src={avatarImage} alt="User Avatar" width={48} height={48} className="rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{user?.name || "User"}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email || "No email"}</p>
        </div>
        <Badge variant="secondary">FREE</Badge>
      </div>
      <PricingDialog trigger={<Button className="w-full">Upgrade to Pro</Button>} />
    </div>
  );
};

export const DashboardMobileSidebar = () => {
  const { user, isLoading } = useUser();
  const { isOpen, closeSidebar } = useSidebarState();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${ isOpen ? "opacity-100" : "opacity-0 pointer-events-none" }`}
        onClick={closeSidebar}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-4/5 max-w-sm flex-col bg-background transition-transform duration-300 ease-in-out md:hidden ${ isOpen ? "translate-x-0" : "-translate-x-full" }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={28} height={28} priority />
            <span className="font-semibold text-foreground">Inquora</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={closeSidebar} className="text-muted-foreground">
            <ChevronsLeft className="h-6 w-6" />
          </Button>
        </div>
        <MobileNavigation onItemClick={closeSidebar} />
        <div className="mt-auto p-4 border-t border-border">
          <UserProfile user={user} isLoading={isLoading} />
        </div>
      </aside>
    </>
  );
};